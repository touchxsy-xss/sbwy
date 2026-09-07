import { $, $$, bind, label, icon, escape, modal, closeModal, formModal, field, confirm, toast, busy, active, list, empty } from '../ui.js';
import { id, now } from '../services/store.js';
import { createRadio } from '../services/audio.js';
import { communityById, contentAudienceText, isContentVisible } from '../data/seed.js';

const buttons = rx => $$('button,a').filter(b => rx.test(label(b)));
const on = (rx, fn) => buttons(rx).forEach(b => { if (!b.dataset.action) bind(b, label(b), () => fn(b)); });
const glyph = text => $$('button').filter(b => !label(b) && $('.material-symbols-outlined', b)?.textContent.trim() === text);

export function initContent(ctx) {
  if (ctx.route.key === 'weekly') weekly(ctx);
  if (ctx.route.key === 'broadcast') broadcast(ctx);
  if (ctx.route.key === 'home') home(ctx);
  if (ctx.route.key === 'media') media(ctx);
}
function weekly(ctx) {
  const { route, state, store, go } = ctx;
  const propertyContext = state().contexts.property;
  const currentCommunity = communityById(propertyContext.communityId, state().organization);
  const scope = `${currentCommunity?.name || '当前小区'}专属内容`;
  const scopeBox = document.createElement('section');
  scopeBox.className = 'demo-scope-banner';
  scopeBox.innerHTML = `${icon('location_city')}<div><strong>本次发布范围：${escape(scope)}</strong><small>物业运营端只可发布本小区内容；“声边平台统一发布”由平台端后续管理。</small></div>`;
  $('main > div')?.prepend(scopeBox);
  const inputs = $$('main input,main select,main textarea').filter(e => !e.closest('#mobile-preview-modal'));
  const text = $('main textarea');
  const title = $('main input[placeholder]');
  const draftKey = 'weekly';
  const draft = state().drafts[draftKey];
  const textareas = $$('main textarea');
  const counters = $$('[data-editor-counter]');
  const updateCounters = () => counters.forEach((counter, index) => {
    counter.textContent = `已输入 ${textareas[index]?.value.length || 0} 字`;
  });
  if (draft) inputs.forEach((e, i) => { if (draft[i] !== undefined) e.value = draft[i]; });
  updateCounters();
  const save = () => { store.saveDraft(draftKey, inputs.map(e => e.value)); toast('草稿已保存'); };
  on(/保存草稿/, save);
  inputs.forEach(e => e.addEventListener('input', () => {
    store.saveDraft(draftKey, inputs.map(e => e.value));
    updateCounters();
  }));
  const publish = () => {
    if (!text.value.trim()) throw new Error('请填写本周工作总结');
    if (title && !title.value.trim()) throw new Error('请填写周报标题');
    if (route.key === 'weekly' && !$$('main textarea')[1].value.trim()) throw new Error('请填写下周工作计划');
    confirm('发布工作周报', `将以“${scope}”发布至居民端声边视听，其他小区居民不可见。`, () => {
      return store.publishContent({ id: id('WEEK'), title: title?.value.trim() || '物业服务工作周报', body: text.value, plan: $$('main textarea')[1]?.value || '', kind: 'article', author: '物业服务中心', files: state().drafts['uploads-' + route.key] || [] });
    }, { label: '确认发布', after: article => modal('发布成功', `<p>${escape(article.title)}</p><p>发布范围：${escape(contentAudienceText(article, state().organization))}。</p>`, [{ label: '查看居民端内容', run: () => go('/mobile/articles/' + article.id) }, { label: '继续采编', secondary: true, run: closeModal }]) });
  };
  on(/提交并同步|提交发布/, publish);
  on(/确认上传/, () => { save(); toast('周报与附件已保存，尚未发布'); });
  const preview = $('#mobile-preview-modal');
  if (preview) {
    bind($('#preview-trigger-btn'), '手机端呈现预览', () => {
      $('h2,h3,h4', preview).textContent = title.value;
      const paragraph = $$('p', preview).at(-1); if (paragraph) paragraph.textContent = text.value;
      preview.classList.remove('hidden'); preview.setAttribute('role', 'dialog'); preview.setAttribute('aria-modal', 'true');
      $('#close-preview-modal-btn').focus();
    });
    bind($('#close-preview-modal-btn'), '关闭模拟预览', () => preview.classList.add('hidden'));
    preview.addEventListener('click', e => { if (e.target === preview) preview.classList.add('hidden'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') preview.classList.add('hidden'); });
  }
  on(/^\[(工程维保|环境保洁|安全消控|便民客服|社区文化)\]$/, b => {
    text.value += `\n【${label(b).slice(1, -1)}】\n`; text.focus(); store.saveDraft(draftKey, inputs.map(e => e.value)); updateCounters();
  });
  const formats = { format_bold: ['**', '**'], title: ['## ', ''], format_list_bulleted: ['- ', ''], format_list_numbered: ['1. ', ''], format_quote: ['> ', ''] };
  for (const [name, [before, after]] of Object.entries(formats)) glyph(name).forEach(b => bind(b, '文本格式' + name, () => {
    const start = text.selectionStart, end = text.selectionEnd;
    text.setRangeText(before + (text.value.slice(start, end) || '内容') + after, start, end, 'select');
    text.dispatchEvent(new Event('input')); text.focus();
  }));
  on(/AI 润色|重新生成音频/, b => {
    if (label(b).includes('音频')) return ctx.speech(text.value, b);
    text.value = text.value.trim().replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');
    text.dispatchEvent(new Event('input')); toast('已整理段落与空格（本地规则处理）');
  });
  on(/切换音色/, () => formModal('播报音色', field('voice', '音色', state().settings.voice || 'default', { choices: [['default', '系统默认中文音色'], ...speechSynthesis.getVoices().filter(v => v.lang.startsWith('zh')).map(v => [v.name, v.name])] }), v => { store.change(s => s.settings.voice = v.voice); toast('音色已更新'); }));
  glyph('calendar_month').forEach(b => bind(b, '周报周期', () => formModal('周报周期', field('start', '开始日期', now().slice(0, 10), { type: 'date' }) + field('end', '结束日期', now().slice(0, 10), { type: 'date' }), v => {
    if (v.end < v.start) throw new Error('结束日期不能早于开始日期');
    store.saveDraft('weekly-period', v); toast(`周期已设置为${v.start}至${v.end}`);
  })));
  const archive = buttons(/全部归档/)[0];
  if (archive) bind(archive, '全部周报归档', () => articleList(ctx, state().articles.filter(a => a.kind === 'article')));
  glyph('visibility').forEach((b, i) => bind(b, '查看历史周报', () => articleDetail(ctx, state().articles.filter(a => a.kind === 'article')[i % state().articles.filter(a => a.kind === 'article').length].id)));
}
function broadcast(ctx) {
  const { state, store } = ctx;
  const propertyContext = state().contexts.property;
  const currentCommunity = communityById(propertyContext.communityId, state().organization);
  const scopeBox = document.createElement('section');
  scopeBox.className = 'demo-scope-banner';
  scopeBox.innerHTML = `${icon('campaign')}<div><strong>紧急通知仅下发至：${escape(currentCommunity?.name || '当前小区')}</strong><small>该通知不会覆盖其他物业公司或合作小区。</small></div>`;
  $('main > div')?.prepend(scopeBox);
  const title = $('#noticeTitle'), body = $('#noticeContent');
  const template = { title: title.value, body: body.value };
  let hours = 24, category = '常规紧急通知', editing = null;
  const updatePreview = () => {
    $('#charCounter').textContent = `${body.value.length} / 300 字`;
    $('#previewMarqueeText').textContent = body.value || '暂无通知内容';
  };
  const live = () => {
    const notice = state().notices.find(n => n.active && isContentVisible(n, propertyContext.communityId) && (!n.expiresAt || n.expiresAt > now()));
    $('#currentActiveTitle').textContent = notice?.title || '暂无生效中的广播';
    $('#currentActiveSnippet').textContent = notice?.body || '通知已下线';
  };
  body.addEventListener('input', updatePreview);
  $$('.category-pill').forEach(btn => bind(btn, label(btn), () => { category = label(btn); active($$('.category-pill'), btn); }));
  const durations = buttons(/^(24小时自动结束|48小时|直到管家手动撤回)$/);
  durations.forEach((b, i) => bind(b, label(b), () => { hours = [24, 48, 0][i]; active(durations, b); }));
  on(/追加客服热线|追加抢修范围|追加应急取水点/, b => {
    const phrases = { 追加客服热线: ' 物业服务热线：400-880-6899。', 追加抢修范围: ' 抢修范围：16号楼地下主管网。', 追加应急取水点: ' 临时取水点：中央花园小广场。' };
    const phrase = phrases[label(b)];
    if (body.value.length + phrase.length > 300) throw new Error('内容超过300字上限');
    body.value += phrase; updatePreview();
  });
  on(/清空重写/, () => { body.value = ''; updatePreview(); });
  on(/恢复默认抢修模板/, () => { title.value = template.title; body.value = template.body; editing = null; updatePreview(); });
  on(/语气更亲和|更严肃专业|精简通顺|AI 润色/, b => {
    const prefix = label(b).includes('亲和') ? '亲爱的邻居们，' : label(b).includes('严肃') ? '重要通知：' : '';
    body.value = (prefix + body.value.trim().replace(/\s+/g, ' ')).slice(0, 300); updatePreview(); toast('已应用本地措辞规则');
  });
  on(/编辑内容/, () => {
    const n = state().notices.find(n => n.active); if (!n) throw new Error('当前没有在线通知');
    editing = n.id; title.value = n.title; body.value = n.body; updatePreview(); title.focus(); title.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  on(/下线撤回/, () => confirm('撤回当前广播', `确认将${currentCommunity?.name || '当前小区'}的通知从居民首页下线？`, () => store.change(s => s.notices.forEach(n => { if (n.active && n.audience === 'community' && n.communityIds?.includes(propertyContext.communityId)) n.active = false; })), { after: live }));
  on(/对焦居民端预览/, () => { updatePreview(); $('#mobileFrame').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  on(/AI语音引擎调试/, b => ctx.speech(body.value, b));
  bind($('#publishBtn'), '立即发布并同步滚动', () => {
    if (!title.value.trim() || !body.value.trim()) throw new Error('请填写通知标题和正文');
    if (body.value.length > 300) throw new Error('正文不能超过300字');
    confirm('发布社区通知', `发布后仅在${currentCommunity?.name || '当前小区'}居民首页显示，不会向真实住户或喇叭发送消息。`, () => {
      const notice = store.publishNotice({ id: editing || id('NOTICE'), title: title.value.trim(), body: body.value.trim(), category, voice: $('#voiceToggle').checked, active: true, expiresAt: hours ? new Date(Date.now() + hours * 3600000).toISOString() : null });
      live(); return notice;
    }, { after: () => toast('小区广播已发布，居民首页同步完成') });
  });
  on(/广播下发历史/, () => modal('广播历史', list(state().notices.filter(n => isContentVisible(n, propertyContext.communityId)), n => `<article><strong>${escape(n.title)}</strong><p>${escape(n.body)}</p><small>${escape(contentAudienceText(n, state().organization))} · ${n.active ? '发布中' : '已下线'} · ${new Date(n.at).toLocaleString('zh-CN')}</small></article>`)));
  updatePreview(); live(); window.addEventListener('demo:external', live);
}
function home(ctx) {
  const { state, go, store } = ctx;
  const radio = $('#radioPlayBtn');
  bind(radio, '播放社区广播', () => ctx.speech(state().notices.find(n => n.active && isContentVisible(n, state().user.communityId))?.body, radio));
  glyph('chevron_right').forEach(b => bind(b, '查看广播内容', () => articleDetail(ctx, 'radio')));
  const banner = $$('main div').find(e => e.classList.contains('relative') && e.classList.contains('overflow-hidden') && e.textContent.includes('音乐节'));
  if (banner) bind(banner, '查看社区音乐节', () => go('/mobile/articles/festival'));
  const names = ['garden', 'elevator', 'festival', 'safety'];
  const ids = ['小区绿化升级', '电梯维保深度', '本周六露天', '生活贴士'];
  ids.forEach((title, i) => {
    const node = $$('main h2,main h3,main h4,main p').find(e => e.textContent.trim().startsWith(title));
    if (node) bind(node.closest('article') || node.parentElement, '查看' + node.textContent, () => go('/mobile/articles/' + names[i]));
  });
  const likes = glyph('favorite').concat(buttons(/^\d+$/).filter(b => $('.material-symbols-outlined', b)?.textContent === 'favorite'));
  likes.forEach((b, i) => {
    const key = i === 0 ? 'post-garden' : 'post-floor';
    const count = state().posts.find(p => p.id === key)?.likes || 0;
    const update = () => { b.innerHTML = icon('favorite') + ' ' + (count + (state().likes.includes(key) ? 1 : 0)); b.setAttribute('aria-pressed', String(state().likes.includes(key))); };
    bind(b, '点赞邻里动态', () => { ctx.requireAuth(() => { store.toggle('likes', key); update(); }); }); update();
  });
  const feed = $$('h2,h3').find(e => e.textContent.trim() === '我的生活圈');
  if (feed) bind(feed, '打开生活圈', () => go('/mobile/services?panel=community-feed'));
  on(/^彭一小区/, () => ctx.panel('community'));
  const noticeBox = document.createElement('div'); noticeBox.className = 'bg-surface-container-lowest rounded-xl px-3 py-2 text-body-sm'; noticeBox.id = 'active-broadcast';
  $('main > div').prepend(noticeBox);
  const render = () => {
    const n = state().notices.find(n => n.active && isContentVisible(n, state().user.communityId) && (!n.expiresAt || n.expiresAt > now()));
    noticeBox.hidden = !n;
    noticeBox.innerHTML = n ? `<button class="flex items-center gap-2 w-full text-left text-primary">${icon('campaign')}<span>${escape(n.title)}</span>${icon('chevron_right')}</button>` : '';
    if (n) bind($('button', noticeBox), '查看社区通知', () => modal(n.title, `<p>${escape(n.body)}</p>`, n.voice ? [{ label: '语音播报', run: b => ctx.speech(n.body, b) }] : []));
  };
  render(); window.addEventListener('demo:external', render);
}
function media(ctx) {
  const { state, store, go, route } = ctx;
  bind($('#favorite-btn'), '收藏社区电台', () => {
    ctx.requireAuth(() => { const fav = store.toggle('favorites', 'radio'); $('#favorite-btn').setAttribute('aria-pressed', String(fav)); $('span', $('#favorite-btn')).style.fontVariationSettings = `'FILL' ${fav ? 1 : 0}`; toast(fav ? '已收藏电台' : '已取消收藏'); });
  });
  let speed = 1;
  const play = $('#main-play-btn');
  $('#play-icon').textContent = 'play_arrow';
  const time = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  const radio = createRadio((audio, error) => {
    if (error) return toast(error.message, true);
    $('#play-icon').textContent = audio.paused ? 'play_arrow' : 'pause';
    $('#progress-fill').style.width = (audio.duration ? audio.currentTime / audio.duration * 100 : 0) + '%';
    $('#current-time').textContent = time(audio.currentTime);
    const duration = $('#current-time').nextElementSibling; if (duration && Number.isFinite(audio.duration)) duration.textContent = time(audio.duration);
    $$('#waveform-container span').forEach(bar => bar.style.animationPlayState = audio.paused ? 'paused' : 'running');
  });
  bind(play, '播放或暂停社区电台', radio.toggle);
  bind($('#speed-btn'), '切换播放倍速', () => { speed = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : 1; $('#speed-btn').textContent = speed.toFixed(2) + 'X'; radio.audio.playbackRate = speed; });
  glyph('replay_10').forEach(b => bind(b, '后退10秒', () => radio.seek(radio.audio.currentTime - 10)));
  glyph('forward_30').forEach(b => bind(b, '前进30秒', () => radio.seek(radio.audio.currentTime + 30)));
  bind($('#progress-bar-wrapper'), '调整播放进度', e => {
    const rect = $('#progress-bar-wrapper').getBoundingClientRect(); radio.seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * radio.audio.duration);
  });
  const visibleArticles = () => state().articles.filter(a => isContentVisible(a, state().user.communityId));
  bind($('#playlist-btn'), '社区电台播放列表', () => articleList(ctx, visibleArticles().filter(a => ['audio', 'article'].includes(a.kind))));
  const mediaSections = $$('main section');
  $$('.tab-pill').forEach((b, i) => bind(b, '筛选' + label(b), () => {
    active($$('.tab-pill'), b);
    if (i === 0) { mediaSections.forEach(s => s.hidden = false); articleList(ctx, visibleArticles()); }
    else articleList(ctx, visibleArticles().filter(a => a.kind === ['all', 'audio', 'article', 'video', 'activity'][i]));
  }));
  on(/全部专栏/, () => articleList(ctx, visibleArticles()));
  on(/进入微信阅读/, () => go('/mobile/articles/storm'));
  on(/朗读全文/, b => ctx.speech(state().articles.find(a => a.id === 'storm').body, b));
  const plants = $$('main h4,main h5').find(e => e.textContent.includes('春季绿化'));
  if (plants) bind(plants.parentElement.parentElement, '阅读绿化计划', () => go('/mobile/articles/plants'));
  const videoCards = $$('.cursor-pointer').filter(e => /3分钟看懂|保安小哥/.test(e.textContent));
  videoCards.forEach((card, i) => bind(card, '打开微纪录详情', () => go('/mobile/articles/' + (i === 0 ? 'tank' : 'security'))));
  bind($('#post-voice-btn'), '投递声音作品', () => ctx.requireAuth(() => {
    formModal('有声共创投稿', field('title', '作品标题') + field('body', '作品简介', '', { type: 'textarea' }), v => {
      store.change(s => s.articles.unshift({ ...v, id: id('SUBMISSION'), kind: 'audio', status: '待审核', at: now() })); toast('声音作品简介已提交，可在素材上传处补充附件');
    });
  }));
  const submissions = visibleArticles().filter(a => a.at && a.status !== '待审核');
  if (submissions.length) {
    const box = document.createElement('section'); box.className = 'demo-inline-section';
    box.innerHTML = `<h3 class="text-headline-sm">最新物业周报</h3>` + list(submissions, a => `<button data-new-article="${a.id}"><strong>${escape(a.title)}</strong><small>${new Date(a.at).toLocaleDateString('zh-CN')}</small></button>`);
    $('main > div').prepend(box);
    $$('[data-new-article]', box).forEach(b => bind(b, '查看物业周报', () => go('/mobile/articles/' + b.dataset.newArticle)));
  }
  if (route.detail === 'article') articleDetail(ctx, decodeURIComponent(location.pathname.split('/').pop()));
}
function articleList(ctx, articles) {
  const dlg = modal('社区内容', list(articles, a => `<button data-article="${escape(a.id)}"><strong>${escape(a.title)}</strong><small>${escape(contentAudienceText(a, ctx.state().organization))} · ${{ article: '图文', audio: '电台', video: '微纪录', activity: '活动' }[a.kind]} ${a.status || ''}</small></button>`));
  $$('[data-article]', dlg).forEach(b => bind(b, '打开内容详情', () => ctx.go('/mobile/articles/' + b.dataset.article)));
}
function articleDetail(ctx, articleId) {
  const article = ctx.state().articles.find(a => a.id === articleId && isContentVisible(a, ctx.state().user.communityId));
  if (!article) return modal('内容不存在', empty('该内容不存在或已下线'), [{ label: '返回声边视听', run: () => ctx.go('/mobile/media') }]);
  const imageIndex = { radio: 0, storm: 1, garden: 2, plants: 2, tank: 3, security: 4 };
  const image = ctx.source.media.images[imageIndex[article.id]];
  const actions = [
    { label: ctx.state().favorites.includes(article.id) ? '取消收藏' : '收藏', secondary: true, run: () => ctx.requireAuth(() => { ctx.store.toggle('favorites', article.id); articleDetail(ctx, articleId); }) },
    { label: '分享', secondary: true, run: () => ctx.share(location.origin + '/mobile/articles/' + article.id) },
    { label: '朗读全文', run: b => ctx.speech(article.body, b) }
  ];
  if (article.kind === 'activity') actions.push({ label: '立即报名', run: () => ctx.requireAuth(() => formModal('社区活动报名', field('name', '姓名', ctx.state().user.name) + field('phone', '联系电话', ctx.state().user.phone, { pattern: '1[3-9][0-9]{9}', type: 'tel' }) + field('quantity', '参与人数', 1, { type: 'number', min: 1, max: 10 }), v => {
    ctx.store.change(s => {
      if (s.bookings.some(b => b.productId === article.id && b.status !== '已取消')) throw new Error('该活动已报名，请在预约记录查看');
      s.bookings.unshift({ ...v, id: id('ACT'), productId: article.id, title: article.title, date: '本周六', amount: 0, status: '报名成功', at: now() });
    }); toast('报名成功'); setTimeout(() => ctx.panel('bookings'), 0);
  })) });
  const dlg = modal(article.title, (image ? `<img class="demo-detail-image" src="${escape(image.src)}" alt="${escape(article.title)}">` : '') + `<p class="demo-content-audience">${escape(contentAudienceText(article, ctx.state().organization))} · 发布方：${escape(article.publisher || '物业服务中心')}</p>` + `<p style="white-space:pre-wrap">${escape(article.body)}</p>${article.plan ? `<h3>下周工作计划</h3><p>${escape(article.plan)}</p>` : ''}${article.kind === 'video' ? '<p class="demo-muted">原始设计未提供视频原片，当前展示纪实图文。</p>' : ''}` + list(article.files || [], f => `<button data-article-file="${escape(f.id)}">${escape(f.name)}</button>`), actions);
  $$('[data-article-file]', dlg).forEach(b => bind(b, '打开周报附件', () => ctx.showFile(article.files.find(f => f.id === b.dataset.articleFile))));
}
