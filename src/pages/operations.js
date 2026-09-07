import { $, $$, bind, label, icon, escape, modal, closeModal, formModal, field, confirm, toast, busy, active, csv, list, empty } from '../ui.js';
import { id, now, money, isAmount } from '../services/store.js';
import { statuses, technicians, arrivalPolicies, arrivalStatus, contentAudienceText } from '../data/seed.js';

const buttons = rx => $$('button,a').filter(b => rx.test(label(b)));
const on = (rx, fn) => buttons(rx).forEach(b => { if (!b.dataset.action) bind(b, label(b), () => fn(b)); });
const glyphs = glyph => $$('button').filter(b => $('.material-symbols-outlined', b)?.textContent.trim() === glyph && !label(b));
const date = () => new Date().toLocaleDateString('en-CA');
const orderAction = (ctx, order) => {
  formModal('指派维修师傅', `<p>${escape(order.title)} · ${escape(order.room)}</p>` + field('technician', '维修师傅', order.technician || technicians[0], { choices: technicians }), values => {
    if (order.status === 'assigned') ctx.store.change(s => {
      const current = s.orders.find(o => o.id === order.id);
      current.technician = values.technician;
      current.timeline.push({ at: now(), status: 'assigned', label: '改派给' + values.technician });
    });
    else ctx.store.transition(order.id, 'assigned', values);
    toast('已派发给' + values.technician);
    window.dispatchEvent(new Event('demo:orders'));
  }, '确认派工');
};

export function initOperations(ctx) {
  if (['overview', 'work-orders'].includes(ctx.route.key)) orders(ctx);
  if (ctx.route.key === 'tasks') tasks(ctx);
  if (ctx.route.key === 'checkin') checkin(ctx);
  if (ctx.route.key === 'expenses') expenses(ctx);
  if (ctx.route.key === 'finance') finance(ctx);
  if (ctx.route.key === 'group') group(ctx);
}

function orders(ctx) {
  const { route, state, store, go } = ctx;
  const overview = route.key === 'overview';
  let page = 1, status = '', category = '', term = '', urgent = false, technician = '', day = '';
  const size = overview ? 3 : 4;
  const originalArticles = $$('main article');
  const queue = overview ? $('main tbody') : originalArticles[0].parentElement;
  const template = overview ? $('tr', queue).cloneNode(true) : originalArticles[0].cloneNode(true);
  const pagination = overview ? queue.parentElement.parentElement.nextElementSibling : originalArticles.at(-1).nextElementSibling;
  const cardKeys = [];
  function render() {
    let all = state().orders.filter(o => (!status || (status === 'completed' ? ['completed', 'closed'].includes(o.status) : status === o.status)) &&
      (!category || o.category === category || (category === '水暖卫浴' && /管|水/.test(o.category))) &&
      (!urgent || o.urgent) && (!technician || o.technician === technician) &&
      (!day || o.createdAt.slice(0, 10) === day) &&
      (!term || `${o.id} ${o.room} ${o.title} ${o.contact}`.toLowerCase().includes(term.toLowerCase())));
    const totalPages = Math.max(1, Math.ceil(all.length / size)); page = Math.max(1, Math.min(page, totalPages));
    if (overview) queue.replaceChildren();
    else $$('article[data-order-card], article:not([data-order-card])', queue).forEach(e => e.remove());
    cardKeys.length = 0;
    for (const o of all.slice((page - 1) * size, page * size)) {
      const card = template.cloneNode(true); card.dataset.orderCard = o.id;
      if (overview) {
        const cells = $$('td', card);
        cells[0].innerHTML = `<strong class="text-headline-sm">#${escape(o.id)}</strong><div class="text-label-sm">${escape(o.room)} · ${escape(o.contact)}</div>`;
        cells[1].innerHTML = `<div>${escape(o.title)}</div><small>${escape(o.appointment)}</small>`;
        cells[2].innerHTML = o.photos?.[0]?.src ? `<img class="w-10 h-10 rounded-lg object-cover" src="${escape(o.photos[0].src)}" alt="报修现场">` : `<span class="text-label-sm">${o.photos?.length || 0} 份附件</span>`;
        cells[3].innerHTML = `<span class="px-2 py-1 rounded-full bg-surface-container text-primary">${statuses[o.status]}</span>`;
        cells[4].innerHTML = `<button class="px-3 py-1 rounded-full bg-primary text-on-primary text-label-md" data-dispatch>${o.status === 'pending' ? '派工' : '查看详情'}</button>`;
        queue.append(card);
      } else {
        const identity = $('span.font-headline-sm', card); identity.textContent = '#' + o.id;
        const paragraphs = $$('p', card); if (paragraphs[0]) paragraphs[0].textContent = o.description;
        const address = $('.font-semibold.text-on-surface', card); if (address) address.textContent = o.room;
        const pillRow = identity.parentElement;
        $$(':scope > span', pillRow).slice(1).forEach(e => e.remove());
        pillRow.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded bg-surface-container text-primary text-label-sm">${escape(o.category)}</span><span class="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-label-sm">${statuses[o.status]}</span>`);
        const snapshot = card.lastElementChild;
        snapshot.innerHTML = `<div class="flex items-center gap-2"><div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">${escape((o.technician || '待')[0])}</div><div><strong>${escape(o.technician || '等待指派')}</strong><p class="text-label-sm">${escape(o.appointment)}</p></div></div><div class="flex gap-2"><button class="px-3 py-1 rounded bg-primary text-on-primary text-label-md" data-dispatch>${o.status === 'pending' ? '立即指派师傅' : '查看轨迹详情'}</button></div>`;
        queue.insertBefore(card, pagination);
      }
      const b = $('[data-dispatch]', card);
      bind(b, o.status === 'pending' ? '立即指派师傅' : '查看工单详情', () => o.status === 'pending' ? orderAction(ctx, o) : go('/web/orders/' + o.id));
      bind(card, '打开工单详情', () => go('/web/orders/' + o.id));
      cardKeys.push(o.id);
    }
    let emptyBox = $('#orders-empty');
    if (emptyBox) emptyBox.remove();
    if (!all.length) {
      emptyBox = document.createElement(overview ? 'tr' : 'div'); emptyBox.id = 'orders-empty';
      emptyBox.innerHTML = overview ? `<td colspan="5">${empty('没有符合条件的工单')}</td>` : empty('没有符合条件的工单');
      overview ? queue.append(emptyBox) : queue.insertBefore(emptyBox, pagination);
    }
    if (pagination) {
      pagination.innerHTML = `<span>共 ${all.length} 条工单，当前第 ${page}/${totalPages} 页</span><div class="flex items-center gap-1"><button aria-label="上一页" class="demo-icon" data-page-prev ${page === 1 ? 'disabled' : ''}>${icon('chevron_left')}</button>${Array.from({ length: totalPages }, (_, i) => `<button class="px-2 py-1 rounded ${page === i + 1 ? 'bg-primary text-on-primary' : 'bg-surface-container'}" data-page-number="${i + 1}">${i + 1}</button>`).join('')}<button aria-label="下一页" class="demo-icon" data-page-next ${page === totalPages ? 'disabled' : ''}>${icon('chevron_right')}</button></div>`;
      bind($('[data-page-prev]', pagination), '上一页', () => { page--; render(); });
      bind($('[data-page-next]', pagination), '下一页', () => { page++; render(); });
      $$('[data-page-number]', pagination).forEach(btn => bind(btn, '第' + btn.dataset.pageNumber + '页', () => { page = Number(btn.dataset.pageNumber); render(); }));
    }
  }
  const filters = overview ? buttons(/^(全部工单|紧急报修|水暖电路|公区维保)/) : buttons(/^(全部 \(|待派发|已接单|已到达|处理中|已完工验收)/);
  filters.forEach((btn, i) => bind(btn, '工单筛选' + label(btn), () => {
    if (overview) { urgent = i === 1; category = i === 2 ? '水暖卫浴' : i === 3 ? '公区修缮' : ''; }
    else status = ['', 'pending', 'accepted', 'arrived', 'processing', 'completed'][i] || '';
    active(filters, btn); page = 1; render();
  }));
  const search = overview ? $('main input') : $('main input[placeholder]');
  if (search) { search.dataset.action = '筛选工单'; search.addEventListener('input', () => { term = search.value.trim(); page = 1; render(); }); }
  const selects = $$('main select');
  selects.forEach((select, i) => select.addEventListener('change', () => {
    if (i === 0) category = select.selectedIndex === 0 ? '' : select.value;
    if (i === 1) urgent = select.selectedIndex === 1;
    if (i === 2) technician = select.selectedIndex === 0 ? '' : select.value.split(' ')[0];
    page = 1; render();
  }));
  const dayInput = $$('main input').find(e => !e.placeholder);
  if (dayInput) { dayInput.type = 'date'; dayInput.value = ''; dayInput.addEventListener('change', () => { day = dayInput.value; render(); }); }
  on(/高级筛选/, () => formModal('高级工单筛选', field('status', '工单状态', status, { choices: [['', '全部'], ...Object.entries(statuses)] }) + field('category', '报修分类', category, { choices: [['', '全部'], '水暖卫浴', '强弱电路', '门禁安防', '公区修缮'] }), v => { status = v.status; category = v.category; page = 1; render(); }));
  on(/智能一键分派/, () => confirm('批量派发工单', `将为${state().orders.filter(o => o.status === 'pending').length}个待派工单分配在岗师傅。`, () => {
    state().orders.filter(o => o.status === 'pending').forEach((o, i) => store.transition(o.id, 'assigned', { technician: technicians[i % technicians.length] })); render();
  }));
  on(/一键派发|指派此人|排队顺延|发起转单/, () => {
    const order = state().orders.find(o => o.status === 'pending');
    if (!order) return toast('当前没有待派工单');
    orderAction(ctx, order);
  });
  on(/进入财务对账专区/, () => go('/web/finance'));
  on(/导出调度表/, () => csv('工单调度表.csv', [['工单号', '房号', '内容', '状态', '师傅'], ...state().orders.map(o => [o.id, o.room, o.title, statuses[o.status], o.technician])]));
  render();
  window.addEventListener('demo:orders', render);
  window.addEventListener('demo:external', render);
}

function tasks(ctx) {
  const { state, store, go, qs } = ctx;
  const current = state().orders.find(o => ['pending', 'assigned'].includes(o.status));
  const initialCard = $('#acceptOrderBtn').closest('main > div > div.relative');
  const listSection = $$('main > div > div').find(s => s.textContent.includes('待接普通任务'));
  let mode = qs.get('status') || 'pending';
  const tabButtons = buttons(/^(待接新单|待到岗\/进行中|完工待结)/);
  function render() {
    const select = o => mode === 'pending' ? ['pending', 'assigned'].includes(o.status) : mode === 'accepted' ? ['accepted', 'arrived', 'processing'].includes(o.status) : ['completed', 'closed'].includes(o.status);
    const orders = state().orders.filter(select);
    const mainOrder = orders[0];
    if (initialCard) {
      initialCard.hidden = !mainOrder;
      if (mainOrder) {
        $('h2', initialCard).textContent = `${mainOrder.room} · ${mainOrder.title}`;
        const desc = $$('p', initialCard)[0]; if (desc) desc.textContent = mainOrder.description;
        const policy = mainOrder.sla?.arrivalMinutes || (mainOrder.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes);
        const sla = arrivalStatus(mainOrder);
        $('#orderCountdown').textContent = mode === 'pending' ? `接单后 ${policy} 分钟到岗` : sla.text;
        $('#acceptOrderBtn').innerHTML = icon(mode === 'pending' ? 'bolt' : 'pending_actions') + `<span>${mode === 'pending' ? '立即接单' : '查看履约详情'}</span>`;
        $('#acceptOrderBtn').disabled = mode === 'pending' && !state().settings.listening;
        initialCard.dataset.orderId = mainOrder.id;
      }
    }
    if (listSection) {
      listSection.innerHTML = `<div class="flex justify-between"><strong>${mode === 'pending' ? '待接任务' : mode === 'accepted' ? '进行中任务' : '完工记录'} (${orders.length})</strong><button class="text-label-md text-primary" data-task-sort>按创建时间排序 ${icon('sort')}</button></div>` +
        (orders.slice(1).length ? orders.slice(1).map(o => {
          const policy = o.sla?.arrivalMinutes || (o.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes);
          const timing = mode === 'pending' ? `接单后 ${policy} 分钟内到岗` : arrivalStatus(o).text;
          return `<article class="bg-surface-container-lowest rounded-xl p-card-padding mt-3 shadow-sm"><h3 class="text-headline-sm">${escape(o.title)}</h3><p>${escape(o.room)} · ${statuses[o.status]}</p><p class="text-label-sm">${escape(o.appointment)} · ${escape(timing)}</p><div class="flex gap-2 mt-3"><button class="demo-button secondary" data-task-detail="${o.id}">查看详情</button>${mode === 'pending' ? `<button class="demo-button" data-task-accept="${o.id}" ${!state().settings.listening ? 'disabled' : ''}>抢此单</button>` : ''}</div></article>`;
        }).join('') : empty(orders.length ? '暂无更多任务' : '当前分类没有任务'));
      $$('[data-task-detail]', listSection).forEach(btn => bind(btn, '查看详情', () => go('/worker/orders/' + btn.dataset.taskDetail)));
      $$('[data-task-accept]', listSection).forEach(btn => bind(btn, '抢此单', () => accept(btn.dataset.taskAccept)));
      bind($('[data-task-sort]', listSection), '任务排序', () => {
        store.change(s => s.orders.reverse()); render(); toast('已切换任务顺序');
      });
    }
    active(tabButtons, tabButtons[mode === 'pending' ? 0 : mode === 'accepted' ? 1 : 2]);
  }
  function accept(orderId) {
    if (!state().settings.listening) throw new Error('听单已暂停，请先开启听单');
    const order = state().orders.find(o => o.id === orderId);
    const minutes = order?.sla?.arrivalMinutes || (order?.urgent ? arrivalPolicies.urgent.minutes : arrivalPolicies.standard.minutes);
    confirm('确认接单', `接单后将启动到岗计时，请在 ${minutes} 分钟内完成现场打卡。`, () => store.transition(orderId, 'accepted', { technician: '张建国' }), { after: () => go('/worker/checkin?id=' + orderId) });
  }
  tabButtons.forEach((btn, i) => bind(btn, label(btn), () => { mode = ['pending', 'accepted', 'completed'][i]; const url = new URL(location.href); url.searchParams.set('status', mode); history.replaceState(null, '', url); render(); }));
  bind($('#acceptOrderBtn'), '立即接单', () => {
    const orderId = initialCard.dataset.orderId;
    return mode === 'pending' ? accept(orderId) : go('/worker/orders/' + orderId);
  });
  bind($('#dispatchToggle'), '切换听单状态', () => {
    store.change(s => s.settings.listening = !s.settings.listening);
    $('#dispatchText').textContent = state().settings.listening ? '听单中' : '已暂停'; render();
  });
  $('#dispatchText').textContent = state().settings.listening ? '听单中' : '已暂停';
  bind($('#voicePlayer'), '收听报修语音', () => ctx.speech(state().orders.find(o => o.id === initialCard?.dataset.orderId)?.description, $('button', $('#voicePlayer'))));
  render(); window.addEventListener('demo:external', render);
  const timer = window.setInterval(() => { if (document.visibilityState === 'visible' && mode === 'accepted') render(); }, 30000);
  window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
}

function checkin(ctx) {
  const { store, state, go, qs } = ctx;
  const orderId = qs.get('id') || state().orders.find(o => ['accepted', 'arrived', 'processing'].includes(o.status))?.id;
  const getOrder = () => state().orders.find(o => o.id === orderId);
  let payment = 'online';
  const extras = [];
  const o = getOrder();
  if (!o) { modal('未找到进行中工单', empty('请先接单'), [{ label: '返回任务接单', run: () => go('/worker/tasks') }]); return; }
  $('main h2').textContent = `${o.room} · ${o.title}`;
  const sn = $$('main span').find(e => e.textContent.includes('工单号:'));
  if (sn) sn.textContent = '工单号: ' + orderId;
  const coordinate = $$('main p').find(e => e.textContent.includes('GPS'));
  if (coordinate) coordinate.textContent = '演示打卡点：' + o.room + '（未采集真实GPS）';
  const slaPanel = document.createElement('div');
  slaPanel.id = 'arrival-sla'; slaPanel.className = 'demo-arrival-sla';
  const checkinContainer = $('#checkin-container');
  checkinContainer?.before(slaPanel);
  const update = () => {
    const order = getOrder();
    const checked = ['arrived', 'processing', 'completed', 'closed'].includes(order.status);
    const sla = arrivalStatus(order);
    const due = order.arrivalDueAt ? new Date(order.arrivalDueAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '';
    slaPanel.innerHTML = `${icon('timer')}<div><strong>${escape(sla.text)}</strong><small>${due ? `到岗截止：${due}；以师傅成功接单时刻开始计算。` : '完成接单后系统会生成到岗截止时间。'}</small></div>`;
    slaPanel.dataset.state = sla.state;
    $('#checked-state').classList.toggle('hidden', !checked);
    $('#checkin-btn').classList.toggle('hidden', checked);
    $('#service-timer').textContent = checked ? sla.text : '等待到岗';
    if (checked) {
      const text = $$('span', $('#checked-state')).find(e => e.textContent.includes('已成功'));
      if (text) text.textContent = `${new Date(order.checkinAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 已成功到岗打卡`;
    }
  };
  bind($('#checkin-btn'), '现场到岗打卡', () => {
    const sla = arrivalStatus(getOrder());
    confirm('现场到岗打卡', `确认已到达 ${getOrder().room}？${sla.text}。此次打卡为演示定位。`, () => store.transition(orderId, 'arrived', { checkinAt: now() }), { after: update });
  });
  $$('.payment-option').forEach(el => bind(el, label(el).split(' ')[0], () => {
    if (el.dataset.pay === 'public' && getOrder().scope !== 'public') throw new Error('居民室内专有维修不能记入公共维修基金');
    payment = el.dataset.pay;
    $$('.payment-option').forEach(item => {
      item.classList.toggle('demo-selected', item === el);
      $('.option-check', item).textContent = item === el ? 'radio_button_checked' : 'radio_button_unchecked';
      item.setAttribute('aria-checked', String(item === el)); item.setAttribute('role', 'radio');
    });
  }));
  const submit = buttons(/提交完工/)[0];
  on(/添加其他明码标价/, () => formModal('添加耗材项目', field('name', '耗材名称') + field('price', '单价（元）', '', { type: 'number', min: 0.01, step: '.01' }) + field('quantity', '数量', 1, { type: 'number', min: 1, max: 99 }), v => {
    if (!isAmount(v.price) || !Number.isInteger(Number(v.quantity))) throw new Error('请输入有效单价和整数数量');
    extras.push({ name: v.name, amount: Number(v.price) * Number(v.quantity) });
    const amount = 68 + extras.reduce((sum, e) => sum + e.amount, 0);
    submit.innerHTML = icon('check_circle') + `<span>提交完工并推送账单 (¥${money(amount)})</span>`;
    const box = document.createElement('div'); box.className = 'demo-inline'; box.textContent = `${v.name} × ${v.quantity} · ¥${money(Number(v.price) * Number(v.quantity))}`;
    buttons(/添加其他明码标价/)[0].before(box);
    const total = $$('main .font-display-lg').find(e => e.textContent.trim() === '68.00'); if (total) total.textContent = money(amount);
  }));
  bind(submit, '提交完工并推送账单', () => {
    const order = getOrder();
    if (!['arrived', 'processing'].includes(order.status)) throw new Error('请先完成现场到岗打卡');
    const images = $$('main .grid img').map(img => ({ src: img.src, name: '完工照片' }));
    const photos = [...images, ...(state().drafts['uploads-checkin'] || [])];
    if (!photos.length) throw new Error('请至少上传1张完工照片');
    const amount = Number((68 + extras.reduce((sum, e) => sum + e.amount, 0)).toFixed(2));
    confirm('确认完工结算', `维修总计 ¥${money(amount)}。${payment === 'online' ? '将生成居民待缴维修账单。' : payment === 'offline' ? '确认已在线下收款，登记模拟收款回执。' : '费用将记入公区维护支出台账。'}`, () => {
      store.transition(orderId, 'completed', { photos, amount, payment, paid: payment !== 'online', extras });
      if (payment === 'public') store.change(s => s.expenses.unshift({ id: id('EX'), title: order.title, amount, dept: order.technician, status: 'pending', fund: 'maintenance', channel: '公共维护记账' }));
      if (payment === 'offline') store.record('维修线下收款', orderId);
    }, { label: '确认完工', after: () => go('/worker/orders/' + orderId) });
  });
  if (['completed', 'closed'].includes(o.status)) { submit.disabled = true; submit.textContent = '工单已完工，请勿重复提交'; }
  update();
}

function expenses(ctx) {
  const { store, state, qs } = ctx;
  const fund = qs.get('fund') === 'maintenance' ? 'maintenance' : 'operations';
  let selected = null, term = '', category = '', historical = false;
  const tbody = $('#expense-tbody');
  const template = $('tr', tbody).cloneNode(true);
  const panelFields = { 'panel-title': 'title', 'panel-sn': 'id', 'panel-handler': 'dept', 'panel-invoice': 'invoice', 'panel-channel': 'channel' };
  function select(expense) {
    selected = expense.id;
    for (const [element, key] of Object.entries(panelFields)) if ($('#' + element)) $('#' + element).textContent = expense[key] || '未填写';
    $('#panel-amount').textContent = '¥' + money(expense.amount);
    $('#panel-status-pill').textContent = { paid: '已付款核销', pending: '待主管审批', processing: '财务审核中', rejected: '已驳回' }[expense.status] || expense.status;
    $('#panel-primary-btn-label').textContent = expense.status === 'paid' ? '查看核销凭证' : expense.status === 'rejected' ? '查看驳回记录' : '审批支出';
    $$('tr', tbody).forEach(row => { row.classList.toggle('bg-primary/10', row.dataset.expenseId === selected); $('input', row).checked = row.dataset.expenseId === selected; });
  }
  function render() {
    const rows = state().expenses.filter(e => e.fund === fund && (!term || JSON.stringify(e).toLowerCase().includes(term.toLowerCase())) && (!category || e.title.includes(category)) && (!historical || e.status === 'paid'));
    tbody.replaceChildren();
    rows.forEach(e => {
      const row = template.cloneNode(true); row.dataset.expenseId = e.id;
      const values = ['', e.id, e.title, '¥' + money(e.amount), e.dept, (e.at || '2024-10-24').slice(0, 10), e.channel, { paid: '已付款', pending: '待审批', processing: '审批中', rejected: '已驳回' }[e.status]];
      $$('td', row).forEach((td, i) => { if (i) td.textContent = values[i] || ''; });
      $('input', row).checked = false; tbody.append(row); bind(row, '查看支出详情', () => select(e));
    });
    if (!rows.length) tbody.innerHTML = `<tr><td colspan="8">${empty('没有符合条件的支出')}</td></tr>`;
    const chosen = rows.find(e => e.id === selected) || rows[0];
    if (chosen) select(chosen);
    else { selected = null; $('#panel-title').textContent = '暂无支出记录'; $('#panel-amount').textContent = '¥0.00'; $('#panel-status-pill').textContent = '无记录'; }
    $('#btn-action-primary').disabled = !chosen;
  }
  $('#search-input').addEventListener('input', e => { term = e.target.value; render(); });
  const filter = $$('main select').find(s => !s.id);
  filter?.addEventListener('change', () => { category = filter.selectedIndex ? filter.value : ''; render(); });
  const timeButtons = buttons(/^(本月记账|历史账单)$/);
  timeButtons.forEach((b, i) => bind(b, label(b), () => { historical = !!i; active(timeButtons, b); render(); }));
  bind($('#btn-action-primary'), '审批当前支出', () => {
    const e = state().expenses.find(e => e.id === selected);
    if (!e) return;
    if (['paid', 'rejected'].includes(e.status)) return modal('支出详情', `<h3>${escape(e.title)}</h3><p>¥${money(e.amount)} · ${escape(e.status === 'paid' ? '已核销' : '已驳回')}</p><p>${escape(e.reason || '')}</p>`, [{ label: '下载记录', run: () => csv(e.id + '.csv', [['编号', '用途', '金额', '状态'], [e.id, e.title, e.amount, e.status]]) }]);
    formModal('支出审批', `<p>${escape(e.title)} · ¥${money(e.amount)}</p>` + field('decision', '审批决定', 'paid', { choices: [['paid', '批准核销（模拟付款）'], ['rejected', '驳回']] }) + field('reason', '审批意见', '', { type: 'textarea' }), v => {
      store.change(s => Object.assign(s.expenses.find(x => x.id === e.id), { status: v.decision, reason: v.reason, approvedAt: now() }));
      store.record('支出审批' + (v.decision === 'paid' ? '通过' : '驳回'), e.id); render(); toast('审批结果已保存');
    }, '确认审批');
  });
  const form = $('#new-expense-form');
  ['amount', 'applicant', 'payee', 'remark'].forEach(key => $('#form-' + key).required = true);
  $('#form-amount').min = '0.01'; $('#form-amount').step = '.01';
  $('#form-remark').maxLength = 500;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    busy($('button[type=submit]', form), () => {
      const amount = $('#form-amount').value;
      if (!isAmount(amount)) throw new Error('请输入大于0且最多两位小数的金额');
      const expense = {
        id: id('EX'), amount: Number(amount), title: $('#form-category').value + ' · ' + $('#form-remark').value.trim(),
        dept: $('#form-dept').value + ' · ' + $('#form-applicant').value.trim(), payee: $('#form-payee').value.trim(),
        channel: $('#form-channel').value, invoice: $('#form-taxno').value, status: 'pending', fund, at: now(),
        files: state().drafts['uploads-expenses'] || []
      };
      store.change(s => s.expenses.unshift(expense)); store.record('录入支出', expense.id);
      selected = expense.id; form.reset(); render(); toast('支出已提交审批，流水号 ' + expense.id);
    }).catch(e => toast(e.message, true));
  });
  $('button[type=submit]', form).dataset.action = '提交支出核销与审批流';
  bind($('#btn-reset-form'), '清空支出表单', () => form.reset());
  $$('main button').filter(b => /^[<>]$/.test(label(b)) || ['chevron_left', 'chevron_right'].includes($('.material-symbols-outlined', b)?.textContent.trim())).forEach(b => { b.disabled = true; b.dataset.action = '全部记录已显示'; });
  const selectAll = $('thead input');
  if (selectAll) { selectAll.type = 'checkbox'; selectAll.addEventListener('change', () => $$('tbody input').forEach(i => i.checked = selectAll.checked)); }
  if (fund === 'maintenance') {
    const h = $('main h2'); if (h) h.textContent = '新增维修基金支出';
  }
  render(); window.addEventListener('demo:external', render);
}

function finance(ctx) {
  const { state, store, go } = ctx;
  let tab = ctx.qs.get('tab') || 'property';
  const keys = ['property', 'parking', 'other'];
  function changeTab(key) {
    tab = keys.includes(key) ? key : 'property';
    keys.forEach(k => $('#tab-content-' + k).classList.toggle('hidden', k !== tab));
    active(keys.map(k => $('#tab-btn-' + k)), $('#tab-btn-' + tab));
    const url = new URL(location.href); url.searchParams.set('tab', tab); history.replaceState(null, '', url);
  }
  keys.forEach(key => bind($('#tab-btn-' + key), '切换财务' + key, () => changeTab(key)));
  const ledger = document.createElement('section'); ledger.className = 'demo-inline-section'; ledger.id = 'live-payments';
  $('main > div').append(ledger);
  const render = () => {
    ledger.innerHTML = `<h3 class="text-headline-sm">居民端实时缴费记录</h3>` + list(state().payments, p => `<article><strong>${escape(p.id)} · 实收 ¥${money(p.amount)}</strong><small>${new Date(p.at).toLocaleString('zh-CN')} · ${escape(p.billIds.join('、'))}</small></article>`);
  };
  on(/补录线下缴费/, () => formModal('补录线下缴费', field('bill', '待缴账单', '', { choices: state().bills.filter(b => !b.paid).map(b => [b.id, `${b.room} · ${b.title} · ¥${money(b.amount)}`]) }) + field('receipt', '线下收款凭证号'), v => {
    store.pay([v.bill]); store.record('补录线下缴费凭证', v.receipt); render(); toast('线下缴费已入账');
  }));
  on(/登记新收费项/, () => formModal('登记收费项目', field('title', '收费名称') + field('room', '房号', state().user.room) + field('amount', '应收金额', '', { type: 'number', min: '.01', step: '.01' }), v => {
    if (!isAmount(v.amount)) throw new Error('金额格式不正确');
    store.change(s => s.bills.unshift({ ...v, id: id('BILL'), amount: Number(v.amount), type: 'others', book: 'current', paid: false }));
    toast('收费项目已登记，居民端其他费用中可见');
  }));
  on(/派发走访/, () => formModal('欠费走访任务', field('staff', '负责管家', '李明') + field('note', '走访范围与事项', '16-20号楼租户费用交接核实', { type: 'textarea' }), v => { store.record('派发走访', v.staff + ' · ' + v.note); toast('走访任务已保存'); }));
  on(/续期|解禁\/补缴/, el => formModal('车位续期与补缴', `<p>${escape(el.closest('tr')?.innerText || '')}</p>` + field('months', '续期月数', '1', { type: 'number', min: 1, max: 24 }), v => {
    if (!Number.isInteger(Number(v.months))) throw new Error('续期月数须为整数');
    store.record('车位续期', v.months + '个月'); toast('续期申请已登记，待财务核对');
  }));
  on(/^(明细|详情|审批单)$/, el => modal('账目明细', `<p>${escape(el.closest('tr')?.innerText)}</p>`));
  const parkingTabs = buttons(/^(全部车位|临停流水)$/);
  parkingTabs.forEach((b, i) => bind(b, label(b), () => { active(parkingTabs, b); if (i) ctx.panel('logs'); }));
  const year = $('main select');
  year?.addEventListener('change', () => {
    const rows = $$('tbody tr', $('#tab-content-' + tab));
    rows.forEach((r, i) => r.hidden = year.selectedIndex === 1 && i > 1);
    toast(`已切换${year.value}`);
  });
  const pagination = buttons(/^[1238]$/);
  pagination.forEach(b => { b.disabled = true; b.title = '演示台账当前已显示全部记录'; b.dataset.action = '全部记录已显示'; });
  changeTab(tab); render(); window.addEventListener('demo:external', render);
}

function group(ctx) {
  const { state, store, go, qs } = ctx;
  const groupState = state();
  const org = groupState.organization;
  const groupOverview = document.createElement('section');
  groupOverview.className = 'demo-group-overview';
  groupOverview.id = 'group-organization';
  const companyTree = org.companies.map(company => {
    const communities = org.communities.filter(community => community.companyId === company.id);
    const communityRows = communities.length
      ? communities.map(community => {
        const orderCount = groupState.orders.filter(order => order.communityId === community.id && !['closed', 'cancelled'].includes(order.status)).length;
        const contentCount = groupState.articles.filter(article => article.audience === 'community' && article.communityIds?.includes(community.id)).length;
        return `<li><span>${escape(community.name)}</span><small>${orderCount} 个进行中工单 · ${contentCount} 条小区内容</small></li>`;
      }).join('')
      : '<li><span>待接入小区</span><small>可由集团新增合作项目</small></li>';
    return `<article class="demo-group-company"><div><span class="demo-tree-branch">物业公司</span><h3>${escape(company.name)}</h3></div><button class="demo-button secondary" data-group-company="${escape(company.id)}">查看管辖</button><ul>${communityRows}</ul></article>`;
  }).join('');
  const platformContent = groupState.articles.filter(article => article.audience === 'platform');
  const communityContent = groupState.articles.filter(article => article.audience === 'community');
  groupOverview.innerHTML = `<div class="demo-group-heading"><div><span class="demo-tree-kicker">声边集团</span><h2>集团运营中枢</h2><p>集团统一治理物业公司、小区运营与声边内容分发。</p></div><div class="demo-group-actions"><button class="demo-button" data-group-content>查看内容矩阵</button><button class="demo-button secondary" data-group-orders>查看在管工单</button></div></div><div class="demo-group-metrics"><article><strong>${org.companies.length}</strong><span>物业公司</span></article><article><strong>${org.communities.length}</strong><span>在管小区</span></article><article><strong>${platformContent.length}</strong><span>平台统一内容</span></article><article><strong>${communityContent.length}</strong><span>小区专属内容</span></article></div><div class="demo-group-tree"><div class="demo-platform-root">${icon('graphic_eq')}<strong>声边平台</strong><small>统一内容发布、组织治理、跨小区运营汇总</small></div><div class="demo-company-grid">${companyTree}</div></div>`;
  $('main > div')?.prepend(groupOverview);
  $$('[data-group-company]', groupOverview).forEach(button => bind(button, '查看物业公司管辖小区', () => {
    const company = org.companies.find(item => item.id === button.dataset.groupCompany);
    const communities = org.communities.filter(community => community.companyId === company.id);
    modal(company.name + ' · 在管小区', list(communities, community => {
      const orders = groupState.orders.filter(order => order.communityId === community.id && !['closed', 'cancelled'].includes(order.status)).length;
      const contents = groupState.articles.filter(article => article.audience === 'community' && article.communityIds?.includes(community.id)).length;
      return `<article><strong>${escape(community.name)}</strong><small>进行中工单 ${orders} 个 · 小区专属内容 ${contents} 条</small></article>`;
    }));
  }));
  bind($('[data-group-content]', groupOverview), '查看集团内容矩阵', () => modal('集团内容矩阵', list(groupState.articles, article => `<article><strong>${escape(article.title)}</strong><small>${escape(contentAudienceText(article, org))} · 发布方：${escape(article.publisher || '物业服务中心')}</small></article>`)));
  bind($('[data-group-orders]', groupOverview), '查看集团在管工单', () => modal('集团在管工单', list(groupState.orders.filter(order => !['closed', 'cancelled'].includes(order.status)), order => `<article><strong>${escape(order.title)}</strong><small>${escape(org.communities.find(community => community.id === order.communityId)?.name || '未归属小区')} · ${statuses[order.status]}</small></article>`)));
  bind($('#btn-reconcile'), '银行一键对账', btnEvent => busy($('#btn-reconcile'), () => {
    const actual = state().payments.reduce((sum, p) => sum + p.amount, 0);
    store.record('模拟银行对账', `${state().payments.length}笔，共¥${money(actual)}`);
    modal('对账结果（演示）', `<p>模拟支付流水：${state().payments.length}笔</p><p>总实收：¥${money(actual)}</p><p>当前演示账单与收款流水已核对。</p>`, [{ label: '下载对账单', run: () => csv('集团对账.csv', [['交易号', '金额', '时间'], ...state().payments.map(p => [p.id, p.amount, p.at])]) }]);
  }));
  const accountNames = {
    group: '集团归集账户', jinxiu: '锦绣华庭项目账户', pengyi: '彭一小区项目账户',
    penger: '彭二新村项目账户', lvzhou: '绿洲家园项目账户'
  };
  glyphs('swap_horiz').forEach(btn => bind(btn, '发起资金调拨', () => {
    const accounts = Object.keys(state().balances).map(key => [key, `${accountNames[key]}（余额 ¥${money(state().balances[key])}）`]);
    formModal('发起资金调拨（演示）',
      field('from', '调出账户', 'group', { choices: accounts }) +
      field('to', '接收账户', 'pengyi', { choices: accounts }) +
      field('amount', '划拨金额', '', { type: 'number', min: '0.01', step: '0.01' }) +
      field('reason', '调拨原由与审批批文号', '', { type: 'textarea', maxLength: 200 }),
      values => {
        const transfer = store.transfer({ ...values, amount: Number(values.amount) });
        modal('模拟调拨成功', `<p>调拨编号：${escape(transfer.id)}</p><p>${escape(accountNames[transfer.from])}已向${escape(accountNames[transfer.to])}模拟划拨 ¥${money(transfer.amount)}。</p><p class="demo-muted">仅保存到当前浏览器的演示记录，未连接银行、真实账务或任何外部系统。</p>`);
        return false;
      },
      '确认模拟调拨'
    );
  }));
  const rows = $$('#matrix-table tbody tr');
  const matrix = $('#matrix-table');
  const analysisHeading = $$('h3').find(h => h.textContent.includes('多项目聚合收入与支出构成'));
  const analysis = analysisHeading?.closest('.lg\\:col-span-5');
  if (analysis) analysis.id = 'group-analysis';
  if (qs.get('view') === 'expenditure') {
    const heading = matrix?.querySelector('h2');
    const description = matrix?.querySelector('h2 + p');
    if (heading) heading.textContent = '集团项目支出对账（全小区）';
    if (description) description.textContent = '先按小区查看支出明细，再查看底部的全部小区聚合分析；不会跳转到单个物业后台。';
  }
  const showProject = row => {
    const cells = $$('td', row).map(td => td.innerText.replace(/\s+/g, ' ').trim());
    const project = cells[0] || '当前小区';
    const detail = `<dl class="demo-meta"><dt>小区实际情况</dt><dd>${escape(project)}</dd><dt>管理体量</dt><dd>${escape(cells[1] || '暂无')}</dd><dt>今日实时收款</dt><dd>${escape(cells[2] || '暂无')}</dd><dt>本月综合收缴率</dt><dd>${escape(cells[3] || '暂无')}</dd><dt>今日支出审批</dt><dd>${escape(cells[4] || '暂无')}</dd><dt>当日净现金流</dt><dd>${escape(cells[5] || '暂无')}</dd><dt>维修金专户结余</dt><dd>${escape(cells[6] || '暂无')}</dd><dt>风控健康度</dt><dd>${escape(cells[7] || '暂无')}</dd></dl><p>以上为集团财务中枢当前汇总的该小区实际经营数据，包含收款、支出、现金流和维修金余额。</p>`;
    modal(project + ' · 实际经营情况', detail, [{ label: '查看全部小区分析', run: () => { closeModal(); analysis?.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }]);
  };
  rows.forEach(row => {
    row.classList.add('cursor-pointer');
    bind(row, '查看小区实际情况', e => {
      if (e.target.closest('button,a')) return;
      showProject(row);
    });
  });
  const search = $('main input[placeholder*="搜索小区"]');
  search?.addEventListener('input', () => rows.forEach(r => r.hidden = !r.textContent.includes(search.value.trim())));
  on(/过滤状态/, b => formModal('项目状态筛选', field('filter', '风控状态', 'all', { choices: [['all', '全部项目'], ['risk', '风险预警'], ['normal', '正常运营']] }), v => {
    rows.forEach(r => { const risk = /欠费风险|抢修支出偏高/.test(r.textContent); r.hidden = v.filter === 'risk' ? !risk : v.filter === 'normal' ? risk : false; });
    b.textContent = '过滤状态: ' + ({ all: '全部项目', risk: '风险预警', normal: '正常运营' })[v.filter];
  }));
  glyphs('visibility').forEach(b => bind(b, '项目支出对账详情', () => {
    showProject(b.closest('tr'));
  }));
  glyphs('open_in_new').forEach(b => bind(b, '打开小区对账明细', () => {
    showProject(b.closest('tr'));
  }));
  on(/穿透核查明细/, () => {
    rows.forEach(r => r.hidden = !/欠费风险|抢修支出偏高/.test(r.textContent)); $('#matrix-table').scrollIntoView({ behavior: 'smooth' });
  });
  glyphs('priority_high').forEach(b => bind(b, '风险项目详情', () => modal('风险项目', `<p>${escape(b.closest('tr').innerText)}</p>`)));
  const ranges = buttons(/^(今日实时|本周|本月|本季度|年度)$/);
  ranges.forEach(b => bind(b, '切换统计周期', () => {
    active(ranges, b);
    modal(label(b) + '收支明细', list(state().payments, p => `<article>${p.id} · ¥${money(p.amount)} · ${new Date(p.at).toLocaleDateString('zh-CN')}</article>`));
  }));
  $$('header button').filter(b => $('.material-symbols-outlined', b)?.textContent.trim() === 'warning').forEach(b => bind(b, '查看风控预警', () => {
    modal('风控预警', list(rows.filter(r => /欠费风险|抢修支出偏高/.test(r.textContent)), r => `<article>${escape(r.innerText)}</article>`));
  }));
}
