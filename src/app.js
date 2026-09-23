import { pages, matchRoute, navRoutes } from './routes.js';
import { createStore, isPhone, now, id, money } from './services/store.js';
import { saveFile, readFile, deleteFile } from './services/files.js';
import { statuses, arrivalStatus } from './data/seed.js';
import source from './data/source.json';
import { $, $$, bind, label, icon, escape, modal, closeModal, formModal, field, confirm, toast, busy, csv, download, list, empty } from './ui.js';
import { initResident } from './pages/resident.js';
import { initOperations } from './pages/operations.js';
import { initContent } from './pages/content.js';
import { currentUser } from './api/auth.js';
import { currentPropertyCompany } from './api/property-companies.js';
import { listCommunities } from './api/communities.js';

const route = matchRoute(location.pathname) || pages.find(p => p.key === document.documentElement.dataset.page);
document.documentElement.dataset.group = route.group;
const store = createStore(localStorage, () => window.dispatchEvent(new Event('demo:change')));
const state = () => store.read();
const qs = new URLSearchParams(location.search);
const role = route.key === 'group' || (route.key === 'login' && qs.get('role') === 'group') ? 'group' : route.group === 'web' ? 'admin' : route.group === 'worker' ? 'worker' : 'resident';
const sessionKey = 'shengbian-auth-' + role;
const signedIn = () => sessionStorage.getItem(sessionKey) === 'yes';
function safeNext(next) { return typeof next === 'string' && /^\/(mobile|web|worker)\//.test(next) && !next.includes('\\') ? next : '/mobile/home'; }
function go(url) { location.assign(safeNext(url)); }
function login() {
  const base = location.pathname === '/web/group' || role === 'group' ? '/web/login?role=group&' : `/${route.group}/login?`;
  go(base + `next=${encodeURIComponent(location.pathname + location.search)}`);
}
function requireAuth(fn) { if (!signedIn()) return login(); return fn(); }
function back() {
  if (document.referrer.startsWith(location.origin) && history.length > 1) history.back();
  else go(route.group === 'web' ? '/web/overview' : route.group === 'worker' ? '/worker/tasks' : '/mobile/home');
}
function signOut() {
  confirm('退出登录', '确认退出当前演示账号？业务记录会继续保存在此浏览器。', () => {
    if (sessionStorage.getItem('shengbian-api-auth-' + role) === 'yes') {
      import('./api/auth.js').then(({ logout }) => logout().catch(() => {}));
      sessionStorage.removeItem('shengbian-api-auth-' + role);
    }
    sessionStorage.removeItem(sessionKey);
  }, { after: () => go(role === 'group' ? '/web/login?role=group' : `/${route.group}/login`) });
}
if (!route.public && !signedIn()) {
  login();
} else {
  start();
}

function start() {
  document.title = `${route.name} | 声边物业`;
  const ctx = { route, qs, role, source, store, state, go, back, login, signedIn, requireAuth, panel, orderDetail, showOrders, upload, showFile, speech, share, contact, notify, signOut, safeNext };
  hydrateApiContext(role, store);
  if (!state().expenses.length && !state().logs.some(l => l.action === '初始化支出台账')) {
    store.change(s => {
      s.expenses = source.expenses.expenses.map(a => ({
        id: a['data-sn'], title: a['data-title'], amount: Number(a['data-amount'].replace(/[¥,]/g, '')),
        dept: a['data-dept'], invoice: a['data-invoice'], channel: a['data-channel'], status: a['data-status'], budget: a['data-budget'], fund: 'operations'
      }));
      s.logs.push({ id: id('LOG'), action: '初始化支出台账', target: '', at: now() });
    });
  }
  $$('a[data-path]').forEach(a => {
    const path = navRoutes[a.dataset.path]; a.href = path;
    a.removeAttribute('aria-current');
    a.classList.remove('bg-primary-container', 'text-on-primary-container', 'text-primary-container', 'font-headline-sm');
    const current = new URL(path, location.origin);
    if (current.pathname === location.pathname && current.search === location.search) {
      a.setAttribute('aria-current', 'page'); a.classList.add(a.closest('aside') ? 'demo-selected' : 'text-primary-container');
    }
    bind(a, a.title || label(a), () => a.dataset.path === 'login' ? signOut() : go(path));
  });
  if (route.key === 'group') {
    // The group console is reserved for finance and project governance;
    // media operations belong to the dedicated weekly/media workspace.
    $$('a[data-path="converged-media"], a[data-path="capital-pool"]').forEach(a => a.remove());
  }
  if (route.group === 'web' && route.key !== 'group' && $('aside nav')) {
    const nav = $('aside nav');
    // Stitch exported templates contain different subsets of the Web menu.
    // Normalize the shell so navigating between Web pages never makes an
    // existing business entry disappear. Existing links keep their original
    // visual treatment; only missing entries are appended with the same shell
    // classes and are bound through the shared router.
    const legacyMedia = $('a[data-path="media-editor"]', nav);
    if (legacyMedia) {
      legacyMedia.dataset.path = 'weekly-media';
      legacyMedia.href = '/web/media';
      const glyph = $('.material-symbols-outlined', legacyMedia);
      if (glyph) glyph.textContent = 'upload_file';
      const name = $$('span', legacyMedia).find(span => span.textContent.trim() === '声边融媒体采编');
      if (name) name.textContent = '周报附件上传';
      const badgeText = $$('span', legacyMedia).find(span => span.textContent.trim() === '采编');
      if (badgeText) badgeText.parentElement.remove();
    }
    // Make the three finance functions a stable first-level group instead of
    // relying on the different menu fragments exported by each Stitch page.
    const financeCenter = $('a[data-path="finance-center"]', nav);
    const financeAliases = ['expense-management', 'property-expenses', 'property-expenditure', 'maintenance-fund', 'maintenance-fund-expenses', 'reserve-fund-expense'];
    $$('a[data-path]', nav).filter(a => financeAliases.includes(a.dataset.path)).forEach(a => a.remove());
    if (financeCenter) {
      let after = financeCenter;
      for (const [key, text, href, glyph] of [
        ['expense-management', '物业支出管理', '/web/expenses', 'payments'],
        ['maintenance-fund', '维修基金支出管理', '/web/expenses?fund=maintenance', 'home_repair_service']
      ]) {
        const a = financeCenter.cloneNode(true);
        a.dataset.path = key;
        a.href = href;
        a.removeAttribute('aria-current');
        a.classList.remove('bg-primary-container', 'text-on-primary-container', 'text-primary-container', 'font-headline-sm', 'demo-selected');
        const iconNode = $('.material-symbols-outlined', a);
        if (iconNode) iconNode.textContent = glyph;
        const textNode = $$('span', a).find(span => span.textContent.trim() === '物业财务收缴中心');
        if (textNode) textNode.textContent = text;
        if (new URL(href, location.origin).pathname === location.pathname && new URL(href, location.origin).search === location.search) {
          a.setAttribute('aria-current', 'page'); a.classList.add('demo-selected');
        }
        after.after(a); after = a;
        bind(a, text, () => go(href));
      }
    }
    const webMenu = [
      ['overview', '调度概览工作台', '/web/overview', 'space_dashboard'],
      ['work-orders', '工单派发与调度', '/web/work-orders', 'assignment_turned_in'],
      ['finance-center', '物业财务收缴中心', '/web/finance', 'account_balance_wallet'],
      ['expense-management', '物业支出管理', '/web/expenses', 'payments'],
      ['maintenance-fund', '维修基金支出管理', '/web/expenses?fund=maintenance', 'home_repair_service'],
      ['weekly-media', '周报附件上传', '/web/media', 'upload_file'],
      ['broadcast-dispatcher', '紧急通知与广播', '/web/broadcast', 'campaign'],
      ['property-residents', '房产与居民管理', '/web/overview?panel=residents', 'domain'],
      ['system-settings', '系统与权限设置', '/web/overview?panel=settings', 'manage_accounts'],
      ['messages', '消息通知', '/web/overview?panel=messages', 'notifications'],
      ['group-center', '集团运营中枢', '/web/group', 'account_tree'],
      ['worker-tasks', '维修师傅端', '/worker/tasks', 'engineering'],
      ['resident-home', '居民端', '/mobile/home', 'smartphone']
    ];
    for (const [key, text, href, glyph] of webMenu) {
      if ($$('a[data-path]', nav).some(a => a.dataset.path === key && a.textContent.includes(text))) continue;
      const a = document.createElement('a');
      a.href = href;
      a.className = 'flex items-center gap-2 px-3 py-2 rounded-xl text-on-surface-variant text-body-sm';
      a.innerHTML = icon(glyph) + escape(text);
      a.dataset.path = key;
      nav.append(a);
      bind(a, text, () => go(href));
    }
    const button = document.createElement('button'); button.className = 'demo-icon demo-mobile-only'; button.innerHTML = icon('menu'); document.body.append(button);
    bind(button, '打开导航菜单', () => { document.body.classList.toggle('demo-menu-open'); button.setAttribute('aria-expanded', String(document.body.classList.contains('demo-menu-open'))); });
  }
  initResident(ctx);
  initOperations(ctx);
  initContent(ctx);
  common(ctx);
  annotate();
  restoreUploads();
  hydrateProfile();
  if (route.detail === 'order') orderDetail(decodeURIComponent(location.pathname.split('/').pop()));
  if (qs.get('panel') && qs.get('panel') !== 'community-feed') panel(qs.get('panel'));
  if (qs.get('section')) setTimeout(() => document.getElementById(qs.get('section'))?.scrollIntoView({ behavior: 'smooth' }), 50);
  window.addEventListener('storage', e => { if (e.key === 'shengbian-demo-v1') { hydrateProfile(); window.dispatchEvent(new Event('demo:external')); } });
  window.addEventListener('demo:change', hydrateProfile);
  window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
  // Exposed read-only diagnostics make per-page interaction coverage testable.
  window.demoAudit = () => ({
    page: route.key,
    unbound: $$('button,a,.cursor-pointer,[role="button"]').filter(e => !e.dataset.action && !e.closest('dialog') && !e.closest('[data-action]') && !e.matches('input,select,label') && !e.getAttribute('href')?.startsWith('tel:')).map(e => ({ text: label(e), id: e.id, tag: e.tagName })),
    deadLinks: $$('a').filter(e => !e.getAttribute('href') || ['#', 'javascript:void(0)'].includes(e.getAttribute('href'))).length
  });
}

async function hydrateApiContext(currentRole, currentStore) {
  if (!sessionStorage.getItem('shengbian-api-auth-' + currentRole)) return;
  try {
    const [auth, company, communities] = await Promise.all([currentUser(), currentPropertyCompany(), listCommunities()]);
    globalThis.__SHENGBIAN_API_CONTEXT__ = { user: auth.user, scope: auth.scope, memberships: auth.memberships, company, communities };
    currentStore.change(snapshot => {
      if (auth.user?.name) snapshot.user.name = auth.user.name;
      if (auth.user?.phone) snapshot.user.phone = auth.user.phone;
    });
    globalThis.dispatchEvent?.(new CustomEvent('shengbian:api-context', { detail: globalThis.__SHENGBIAN_API_CONTEXT__ }));
  } catch (error) {
    if (error?.status === 401) sessionStorage.removeItem('shengbian-api-auth-' + currentRole);
  }
}

function hydrateProfile() {
  const s = state();
  $$('[data-points]').forEach(e => e.textContent = s.user.points.toLocaleString('zh-CN'));
  $$('[data-user-room]').forEach(e => e.textContent = `${s.user.community} ${s.user.room}`);
  $$('[data-user-name]').forEach(e => e.textContent = s.user.name);
}

function notify(title, body = '') {
  store.change(s => s.messages.unshift({ id: id('MSG'), title, body, at: now(), read: false }));
  toast(title);
}

function contact() {
  modal('联系物业服务中心', '<p>彭一物业管家服务台</p><p><a class="demo-button" href="tel:4008806899">400-880-6899</a></p><p class="demo-muted">紧急情况请直接拨打现实中的物业或应急电话，Demo 不会向真实管家发送通知。</p>', [
    { label: '发送留言', run: () => formModal('给管家留言', field('message', '留言内容', '', { type: 'textarea' }), values => {
      store.change(s => s.messages.unshift({ id: id('MSG'), title: '已提交管家留言', body: values.message, at: now(), read: true }));
      toast('留言已保存，待管家处理（演示）');
    }) },
    { label: '复制企业微信号', secondary: true, run: () => share('SB_Butler_Lin', true) }
  ]);
}

async function share(value = location.href, plain = false) {
  try { await navigator.clipboard.writeText(value); toast(plain ? '已复制' : '链接已复制'); }
  catch { modal('分享', `<input class="demo-field" readonly value="${escape(value)}" aria-label="分享内容">`); }
}

let utterance;
function speech(text, button) {
  if (!('speechSynthesis' in window)) return modal('语音文本', `<p>${escape(text)}</p>`);
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel(); if (button) $('span.material-symbols-outlined', button)?.replaceChildren(document.createTextNode('play_arrow')); return;
  }
  utterance = new SpeechSynthesisUtterance(text || state().articles.find(a => a.id === 'radio').body);
  utterance.lang = 'zh-CN'; utterance.rate = Number(button?.dataset.speed || 1);
  utterance.voice = speechSynthesis.getVoices().find(v => v.name === state().settings.voice) || null;
  if (button) $('span.material-symbols-outlined', button)?.replaceChildren(document.createTextNode('pause'));
  const finish = () => { if (button) $('span.material-symbols-outlined', button)?.replaceChildren(document.createTextNode('play_arrow')); };
  utterance.onend = finish; utterance.onerror = finish;
  speechSynthesis.speak(utterance);
}

async function upload(trigger, options = {}) {
  const input = document.createElement('input'); input.type = 'file'; input.multiple = true;
  input.accept = options.accept || (/(文件|附件|发票|凭证)/.test(label(trigger)) ? 'image/*,.pdf,.doc,.docx,.xls,.xlsx' : /视频/.test(label(trigger)) ? 'image/*,video/*' : 'image/*');
  input.dataset.action = '选择附件';
  const processFiles = async files => {
    const saved = [];
    try {
      const previous = state().drafts['uploads-' + route.key] || [];
      if (previous.length + files.length > (options.limit || 6)) throw new Error(`最多上传${options.limit || 6}个附件`);
      for (const file of files) {
        if (file.size > (file.type.startsWith('video/') ? 50 : 10) * 1024 * 1024) throw new Error('图片/文档上限10MB，视频上限50MB');
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !/\.(pdf|docx?|xlsx?)$/i.test(file.name)) throw new Error('不支持此文件类型');
      }
      for (const file of files) saved.push(await saveFile(file));
      store.saveDraft('uploads-' + route.key, [...previous, ...saved]);
      restoreUploads();
      toast(`已保存${saved.length}个附件`); options.after?.(saved);
    } catch (error) {
      await Promise.allSettled(saved.map(file => deleteFile(file.id)));
      toast(error.message, true);
    }
  };
  input.addEventListener('change', () => processFiles([...input.files]));
  if (options.files) await processFiles(options.files);
  else input.click();
}
function restoreUploads() {
  let box = $('#saved-attachments');
  const files = state().drafts['uploads-' + route.key] || [];
  if (!box && files.length) {
    box = document.createElement('section'); box.id = 'saved-attachments'; box.className = 'demo-inline-section';
    $('main > div')?.append(box);
  }
  if (box) {
    box.innerHTML = `<h3 class="text-headline-sm">已保存附件 (${files.length})</h3><div class="demo-inline">${files.map(f => `<button class="demo-button secondary" data-upload-id="${f.id}">${escape(f.name)}</button>`).join('')}</div>`;
    $$('[data-upload-id]', box).forEach(btn => bind(btn, '查看上传附件', () => showFile(files.find(f => f.id === btn.dataset.uploadId))));
  }
  $$('[data-action]').filter(el => /上传|拍照|照片\/视频/.test(el.dataset.action)).forEach(el => {
    if (el.dataset.dropReady) return;
    el.dataset.dropReady = 'true';
    el.addEventListener('dragover', e => e.preventDefault());
    el.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); upload(el, { files: [...e.dataTransfer.files] }); });
  });
}
async function showFile(file) {
  const blob = await readFile(file.id);
  if (!blob) throw new Error('附件未找到，请重新上传');
  const url = URL.createObjectURL(blob);
  const dlg = modal(file.name, file.type.startsWith('image/') ? `<img class="demo-detail-image" src="${url}" alt="${escape(file.name)}">` : file.type.startsWith('video/') ? `<video controls style="width:100%" src="${url}"></video>` : `<p>${escape(file.name)} · ${Math.ceil(file.size / 1024)} KB</p>`, [
    { label: '下载附件', run: () => { const a = document.createElement('a'); a.href = url; a.download = file.name; a.click(); } },
    { label: '删除附件', secondary: true, run: () => confirm('删除附件', `确认移除“${file.name}”？`, async () => {
      await deleteFile(file.id);
      store.saveDraft('uploads-' + route.key, (state().drafts['uploads-' + route.key] || []).filter(f => f.id !== file.id));
    }, { after: () => location.reload() }) }
  ]);
  dlg.addEventListener('close', () => URL.revokeObjectURL(url), { once: true });
}

function showOrders(filter) {
  const orders = state().orders.filter(o => !filter || filter(o));
  const canReview = o => route.group === 'mobile' && o.status === 'completed' && !state().reviews.some(r => r.orderId === o.id);
  const reviewFor = order => state().reviews.find(review => review.orderId === order.id);
  const orderStatus = order => {
    const review = reviewFor(order);
    if (canReview(order)) return '服务已完成，待评价';
    if (review) return `已评价 · ${review.rating} 星`;
    return statuses[order.status];
  };
  const dlg = modal('我的工单记录', list(orders, o => `<article><button data-order="${escape(o.id)}"><strong>${escape(o.title)}</strong><small>${escape(o.id)} · ${escape(o.room)} · ${escape(orderStatus(o))}</small></button>${canReview(o) ? `<button class="demo-button" data-review-order="${escape(o.id)}">评价服务</button>` : ''}</article>`), [{ label: '新建报修', run: () => go('/mobile/repair') }]);
  $$('[data-order]', dlg).forEach(btn => bind(btn, '工单详情', () => go(`/${route.group}/orders/${btn.dataset.order}`)));
  $$('[data-review-order]', dlg).forEach(btn => bind(btn, '评价维修服务', () => go('/mobile/review?id=' + btn.dataset.reviewOrder)));
}

function orderDetail(orderId) {
  const order = state().orders.find(o => o.id === orderId);
  if (!order) return modal('工单不存在', empty('未找到该工单，请返回工单列表'), [{ label: '返回工单列表', run: () => go(route.group === 'web' ? '/web/work-orders' : route.group === 'worker' ? '/worker/tasks' : '/mobile/profile?panel=orders') }]);
  const actions = [];
  if (route.group === 'web' && ['pending', 'accepted', 'assigned'].includes(order.status)) actions.push({ label: '指派师傅', run: () => assign(order) });
  if (route.group === 'worker' && ['pending', 'assigned'].includes(order.status)) {
    const minutes = order.sla?.arrivalMinutes || (order.urgent ? 30 : 120);
    actions.push({ label: '确认接单', run: () => confirm('确认接单', `${order.title}。接单后请在 ${minutes} 分钟内完成到岗打卡。`, () => store.transition(order.id, 'accepted', { technician: '张建国' }), { after: () => go(`/worker/checkin?id=${order.id}`) }) });
  }
  if (route.group === 'worker' && ['accepted', 'arrived', 'processing'].includes(order.status)) actions.push({ label: '前往现场打卡', run: () => go(`/worker/checkin?id=${order.id}`) });
  if (route.group === 'mobile' && order.status === 'pending') actions.push({ label: '取消报修', secondary: true, run: () => confirm('取消报修', '确认取消尚未派发的报修？', () => store.transition(order.id, 'cancelled'), { after: () => orderDetail(order.id) }) });
  if (route.group === 'mobile' && ['completed', 'closed'].includes(order.status) && !state().reviews.some(r => r.orderId === order.id)) actions.push({ label: '评价服务', run: () => go(`/mobile/review?id=${order.id}`) });
  if (route.group === 'mobile' && order.amount > 0 && !order.paid) actions.push({ label: '缴纳维修费', run: () => go(`/mobile/billing?tab=others&bill=repair-${order.id}`) });
  actions.push({ label: '返回', secondary: true, run: back });
  const review = state().reviews.find(item => item.orderId === order.id);
  const reviewStatus = ['completed', 'closed'].includes(order.status) ? review ? `已评价 · ${review.rating} 星` : '服务已完成，待居民评价' : '尚未进入评价阶段';
  const reviewContent = review
    ? `<section class="demo-review-detail"><h4>居民服务评价 · ${escape(review.rating)} 星</h4><p>${escape((review.tags || []).join(' · ') || '未选择服务标签')}</p><p>${escape(review.comment || '居民未填写文字评价')}</p><small>${new Date(review.at).toLocaleString('zh-CN')}${review.followUp?.status === 'followed_up' ? ` · 物业已回访：${escape(review.followUp.note)}` : ''}</small></section>`
    : '';
  const sla = arrivalStatus(order);
  const due = order.arrivalDueAt ? new Date(order.arrivalDueAt).toLocaleString('zh-CN') : '接单后生成';
  const dlg = modal('工单详情', `<h3>${escape(order.title)}</h3><dl class="demo-meta"><dt>工单号</dt><dd>${escape(order.id)}</dd><dt>状态</dt><dd>${statuses[order.status]}</dd><dt>评价状态</dt><dd>${escape(reviewStatus)}</dd><dt>房屋/位置</dt><dd>${escape(order.room)}</dd><dt>预约时间</dt><dd>${escape(order.appointment)}</dd><dt>到岗时限</dt><dd>${escape(order.sla?.arrivalMinutes || (order.urgent ? 30 : 120))} 分钟；截止 ${escape(due)}</dd><dt>履约状态</dt><dd>${escape(sla.text)}</dd><dt>维修师傅</dt><dd>${escape(order.technician || '等待派工')}</dd><dt>应付金额</dt><dd>¥${money(order.amount)} ${order.amount ? order.paid ? '已缴清' : '待缴费' : ''}</dd></dl>${reviewContent}<p>${escape(order.description)}</p><ol class="demo-timeline">${order.timeline.map(t => `<li>${escape(t.label)}<time>${new Date(t.at).toLocaleString('zh-CN')}</time></li>`).join('')}</ol><div class="demo-inline">${(order.photos || []).map((f, i) => f.src ? `<img src="${escape(f.src)}" alt="报修照片">` : `<button data-file-index="${i}" class="demo-button secondary">${escape(f.name)}</button>`).join('')}</div>`, actions);
  $$('[data-file-index]', dlg).forEach(btn => bind(btn, '查看工单附件', () => showFile(order.photos[btn.dataset.fileIndex])));
}
function assign(order) {
  formModal('指派维修师傅', field('technician', '维修师傅', order.technician || '张建国', { choices: ['张建国', '王德利', '刘建军', '陈大华'] }), values => {
    if (order.status === 'assigned') store.change(s => { const o = s.orders.find(o => o.id === order.id); o.technician = values.technician; o.timeline.push({ label: '改派给' + values.technician, status: 'assigned', at: now() }); });
    else store.transition(order.id, 'assigned', values);
    toast('工单已派发'); setTimeout(() => location.reload(), 300);
  });
}

function panel(name) {
  if (name === 'orders') return showOrders();
  if (name === 'account') return modal('个人中心', `<h3>${escape(role === 'admin' ? '李明 · 物业高级主管' : role === 'worker' ? '张建国 · 维修工程师' : state().user.name)}</h3><p>${escape(state().user.community)} ${escape(state().user.room)}</p>`, [
    { label: '编辑资料', run: () => formModal('编辑个人资料', field('name', '姓名', state().user.name) + field('phone', '手机号码', state().user.phone, { type: 'tel', pattern: '1[3-9][0-9]{9}' }), v => { store.change(s => Object.assign(s.user, v)); toast('资料已更新'); }) },
    { label: '退出登录', secondary: true, run: signOut }
  ]);
  if (name === 'messages') {
    const messages = [...state().messages, ...state().notices.filter(n => n.active).map(n => ({ ...n, body: n.body }))];
    store.change(s => s.messages.forEach(m => m.read = true));
    return modal('消息通知', list(messages, m => `<article><strong>${escape(m.title)}</strong><p>${escape(m.body)}</p><small>${new Date(m.at).toLocaleString('zh-CN')}</small></article>`));
  }
  if (name === 'settings') return formModal('系统与权限设置', field('notifications', '消息提醒', String(state().settings.notifications), { choices: [['true', '开启'], ['false', '关闭']] }) + field('autoDispatch', '自动派单', String(state().settings.autoDispatch), { choices: [['true', '开启'], ['false', '关闭']] }), v => { store.change(s => { s.settings.notifications = v.notifications === 'true'; s.settings.autoDispatch = v.autoDispatch === 'true'; }); toast('设置已保存'); });
  if (name === 'residents') {
    const dlg = modal('房产与居民管理', list([state().user], u => `<article><strong>${escape(u.name)} · ${escape(u.room)}</strong><p>${escape(u.phone)} · ${u.verified ? '已认证' : '待审核'} · ${u.area}㎡</p></article>`), [
      { label: '编辑居民档案', run: () => formModal('居民档案', field('name', '姓名', state().user.name) + field('phone', '手机号', state().user.phone, { type: 'tel', pattern: '1[3-9][0-9]{9}' }) + field('room', '房号', state().user.room), v => { store.change(s => Object.assign(s.user, v)); toast('档案已更新'); }) },
      { label: '认证申请', run: () => modal('房产确权申请', list(state().logs.filter(l => l.action === '提交房产认证'), l => `<article>${escape(l.target)} · 待审核</article>`), [{ label: '通过演示认证', run: () => { store.change(s => s.user.verified = true); toast('认证已通过'); closeModal(); } }]) }
    ]); return dlg;
  }
  if (name === 'bookings') {
    const dlg = modal('服务预约记录', list(state().bookings, b => `<article><strong>${escape(b.title)}</strong><p>${escape(b.date)} · ${escape(b.time || '')} · ¥${money(b.amount)} · ${escape(b.status)}</p><small>${escape(b.id)}</small>${b.status !== '已取消' ? `<button class="demo-button secondary" data-cancel-booking="${b.id}">取消预约</button>` : ''}</article>`));
    $$('[data-cancel-booking]', dlg).forEach(btn => bind(btn, '取消预约', () => confirm('取消预约', '确认取消该服务预约？', () => store.change(s => s.bookings.find(b => b.id === btn.dataset.cancelBooking).status = '已取消'), { after: () => panel('bookings') })));
    return;
  }
  if (name === 'logs') return modal('操作与收支流水', list(state().logs, l => `<article><strong>${escape(l.action)}</strong><small>${escape(l.target)} · ${new Date(l.at).toLocaleString('zh-CN')}</small></article>`), [{ label: '导出流水', run: () => csv('操作流水.csv', [['时间', '操作', '关联编号'], ...state().logs.map(l => [l.at, l.action, l.target])]) }]);
  if (name === 'house') return formModal('切换房屋', field('room', '房屋', state().user.room, { choices: [['16-2-502', '彭一小区 16号楼2单元502室'], ['16-2-502', '彭一小区 地下车位 B1-108（关联502室）']] }), v => { store.change(s => s.user.room = v.room); toast('已切换关联房产'); });
  if (name === 'community') return formModal('选择社区', field('community', '社区', state().user.community, { choices: ['彭一小区', '彭二新村', '锦绣华庭'] }), v => { store.change(s => s.user.community = v.community); toast('当前社区已切换'); });
  if (name === 'policy') return modal('服务协议与隐私政策', '<p>本地产品演示仅用于体验物业服务流程。请使用虚构姓名、测试手机号和演示证件，不要填写真实身份证或产权资料。</p><p>业务数据保存在当前浏览器，附件保存在 IndexedDB；未接入微信、银行、公安、房产核验或真实物业系统。没有真实付款、广播下发或身份认证。</p><p>删除浏览器站点数据可清除演示记录。</p>');
  return modal('服务记录', empty('当前暂无此类记录'));
}

function common(ctx) {
  const textRules = [
    [/一键紧急广播/, () => go('/web/broadcast')],
    [/新建工单/, () => formModal('新建工单', field('description', '故障描述', '', { type: 'textarea' }) + field('room', '报修位置', state().user.room) + field('phone', '联系电话', state().user.phone) + field('appointment', '预约时间', now().slice(0, 10) + ' 下午') + field('category', '故障类型', '水暖卫浴', { choices: ['水暖卫浴', '强弱电路', '门禁安防', '公区修缮'] }), v => { const o = store.createOrder(v); go('/web/orders/' + o.id); })],
    [/我要缴费|我的缴费|在线缴物业费|^立即缴费$|去抵扣/, () => requireAuth(() => go('/mobile/billing'))],
    [/我要报修/, () => requireAuth(() => go('/mobile/repair'))],
    [/我的报修|进度实时查/, () => requireAuth(() => panel('orders'))],
    [/我要服务|全部服务/, () => go('/mobile/services')],
    [/我的积分/, () => requireAuth(() => go('/mobile/points'))],
    [/^(切换房屋|切换|home_pin)|选择房屋/, () => panel('house')],
    [/专属管家|金牌管家在岗|联系师傅|联系业主|电联业主|联系|财务咨询|客服|热线/, contact],
    [/消息通知/, () => panel('messages')],
    [/用户服务协议|隐私政策|服务公约|管理细则|保障细则|预缴政策|积分权益说明|规则/, () => panel('policy')],
    [/^(保存草稿)$/, () => { store.saveDraft(route.key, $$('main input,main textarea,main select').map(e => e.value)); toast('草稿已保存'); }],
    [/取消|关闭|我知道了/, () => { const native = $$('[id]').find(e => /modal|dialog/i.test(e.id) && !e.classList.contains('hidden')); if (native) native.classList.add('hidden'); else closeModal(); }],
    [/上传|拍照|照片\/视频|添加更多工作/, (el) => upload(el)],
    [/打印|凭证|凭据|发票|回单|催告函/, (el) => receipt(el)],
    [/导出|下载|审计汇总/, () => csv('物业业务记录.csv', [['类型', '编号', '金额', '状态'], ...state().orders.map(o => ['工单', o.id, o.amount, statuses[o.status]]), ...state().expenses.map(e => ['支出', e.id, e.amount, e.status])])],
    [/催缴|催促|微信提醒|提醒续费|督办|催办/, (el) => confirm('发送演示提醒', '向当前对象创建提醒记录？不会发送真实短信或微信消息。', () => notify('提醒已加入待办', label(el)))],
    [/银行流水|流水明细|归档|广播下发历史/, () => panel('logs')],
    [/权限|参数设置/, () => panel('settings')],
    [/微信联系/, () => share('SB_Butler_Lin', true)],
    [/分享|转发/, () => share()],
    [/朗读|收听|语音|听简报/, (el) => speech(undefined, el)]
  ];
  const iconRules = {
    arrow_back: back, arrow_back_ios: back, arrow_back_ios_new: back,
    notifications: () => panel('messages'), lock: () => { sessionStorage.removeItem(sessionKey); login(); },
    logout: signOut, person: () => requireAuth(() => panel('account')), account_circle: () => requireAuth(() => panel('account')),
    fullscreen: async () => { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); },
    mic: () => route.group === 'web' ? go('/web/media') : contact(), hearing: () => speech(undefined),
    headset_mic: contact, support_agent: contact, phone_in_talk: contact, call: contact,
    play_arrow: el => speech(undefined, el), pause: el => speech(undefined, el), play_circle: el => speech(undefined, el), volume_up: el => speech(undefined, el),
    share: () => share(), qr_code_scanner: () => formModal('扫码服务', field('code', '门牌/工单编号', '16-2-502'), v => { const o = state().orders.find(o => o.id === v.code); if (o) go('/mobile/orders/' + o.id); else if (v.code === state().user.room) go('/mobile/repair'); else throw new Error('未识别到房号或工单，请重新输入'); }),
    add_photo_alternate: el => upload(el),
    sync: () => { store.record('刷新数据', route.key); location.reload(); }, refresh: el => upload(el),
    download: () => panel('logs'), file_download: () => csv('台账.csv', [['单号', '金额'], ...state().expenses.map(e => [e.id, e.amount])]),
    print: el => receipt(el), zoom_in: el => previewImage(el), visibility: () => panel('logs'),
    open_in_new: () => go('/web/finance'), warning: () => panel('messages'), more_vert: el => contextMenu(el),
    more_horiz: el => contextMenu(el),
    delete: el => removeAttachment(el), close: el => removeAttachment(el)
  };
  $$('button,a,.cursor-pointer,[role="button"]').forEach(el => {
    if (el.dataset.action || el.closest('dialog') || el.matches('input,select,label')) return;
    if (el.closest('[data-action]')) return;
    if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('tel:')) { el.dataset.action = '拨打电话'; return; }
    if (el.tagName === 'IMG') { bind(el, '查看图片', () => previewImage(el)); return; }
    const text = label(el);
    const glyph = $('.material-symbols-outlined', el)?.textContent.trim();
    const rule = textRules.find(([rx]) => rx.test(text));
    if (rule) bind(el, text, () => rule[1](el));
    else if (!text && iconRules[glyph]) bind(el, el.title || glyph, () => iconRules[glyph](el));
    else if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('#') && el.getAttribute('href') !== '#') {
      const target = el.getAttribute('href').slice(1); bind(el, text, () => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }));
    }
  });
  $$('header .material-symbols-outlined,aside .material-symbols-outlined').forEach(el => {
    if (el.closest('button,a,[data-action]')) return;
    const glyph = el.textContent.trim();
    if (glyph === 'person') bind(el.parentElement, '个人中心', () => requireAuth(() => panel('account')));
    if (glyph === 'graphic_eq') bind(el.parentElement.parentElement, '返回首页', () => go(route.group === 'web' ? '/web/overview' : '/mobile/home'));
    if (glyph === 'location_city') bind(el.closest('.cursor-pointer') || el.parentElement, '选择社区', () => panel('community'));
  });
  $$('header input').forEach(input => {
    if (input.dataset.action) return;
    input.dataset.action = '全局搜索';
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const term = input.value.trim().toLowerCase();
        const orders = state().orders.filter(o => JSON.stringify(o).toLowerCase().includes(term));
        const dlg = modal('搜索结果', list(orders, o => `<button data-search-order="${o.id}"><strong>${escape(o.title)}</strong><small>${escape(o.room)} · ${o.id}</small></button>`));
        $$('[data-search-order]', dlg).forEach(btn => bind(btn, '打开搜索结果', () => go(`/${route.group}/orders/${btn.dataset.searchOrder}`)));
      }
    });
  });
}
function contextMenu(el) {
  const text = el.closest('tr,article')?.innerText || '';
  const o = state().orders.find(o => text.includes(o.id)) || state().orders[0];
  modal('工单操作', `<p>${escape(o.title)}</p>`, [{ label: '查看详情', run: () => go(`/${route.group}/orders/${o.id}`) }, ...(route.group === 'web' && o.status === 'pending' ? [{ label: '派发工单', run: () => assign(o) }] : [])]);
}
function previewImage(el) {
  const img = el.tagName === 'IMG' ? el : el.parentElement.querySelector('img');
  if (img) modal('现场图片', `<img class="demo-detail-image" src="${escape(img.src)}" alt="${escape(img.alt)}">`);
}
function removeAttachment(el) {
  const container = el.closest('.aspect-square,.aspect-\\[4\\/3\\]') || el.parentElement;
  if (el.closest('[id*="Modal"],[id*="modal"],[id*="dialog"]')) { el.closest('[id*="Modal"],[id*="modal"],[id*="dialog"]').classList.add('hidden'); return; }
  confirm('移除附件', '确认移除当前附件？', () => { container.remove(); store.record('移除附件', route.key); });
}
function receipt(el) {
  let container = el.closest('tr,article');
  if (!container) {
    container = el.parentElement;
    for (let i = 0; i < 4 && container && !/[¥￥]|缴费时间|流水号/.test(container.textContent); i++) container = container.parentElement;
  }
  const text = container && container.textContent.length < 2500 ? container.innerText : label(el);
  modal('电子凭证（演示）', `<h3>声边物业业务凭证</h3><p>${escape(text)}</p><p>凭证生成时间：${new Date().toLocaleString('zh-CN')}</p><p class="demo-muted">仅供 Demo 展示，不是有效税务发票或银行回执。</p>`, [
    { label: '下载凭证', run: () => download('声边演示凭证.txt', `声边物业演示凭证\n${text}\n仅供产品演示，不作为财务或税务凭证。`) },
    { label: '打印', secondary: true, run: () => window.print() }
  ]);
}
function annotate() {
  $$('a').forEach(a => {
    if (!a.getAttribute('href') || a.getAttribute('href') === '#' || a.getAttribute('href').startsWith('javascript:')) {
      a.href = a.dataset.action === '去办理' ? '/mobile/verify' : `${location.pathname}?panel=${/协议|隐私|公约|细则/.test(label(a)) ? 'policy' : a.dataset.action === '个人中心' ? 'account' : 'logs'}`;
    }
  });
  $$('input,textarea,select').forEach((el, i) => { el.setAttribute('aria-label', el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.closest('label')?.innerText || el.id || `字段${i + 1}`); el.dataset.action ||= '编辑字段'; });
  $$('img').forEach(img => { if (!img.closest('[data-action]')) bind(img, '查看图片', () => previewImage(img)); });
}
