export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const label = element => {
  const clone = element.cloneNode(true);
  clone.querySelectorAll('.material-symbols-outlined,.nav-badge').forEach(e => e.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
};
export const icon = name => `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`;
export function bind(element, action, fn) {
  if (!element) return;
  element.dataset.action = action;
  if (!['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'].includes(element.tagName)) {
    element.tabIndex = 0; element.setAttribute('role', 'button');
    element.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); element.click(); } });
  }
  if (element.tagName === 'BUTTON' && element.type !== 'submit') element.type = 'button';
  if (!label(element) && !element.getAttribute('aria-label')) {
    element.setAttribute('aria-label', element.title || action);
    element.title ||= action;
  }
  element.addEventListener('click', async e => {
    if (e.target.closest('[data-action]') !== element || element.disabled) return;
    if (element.tagName === 'A') e.preventDefault();
    try { await fn(e); } catch (error) { toast(error.message || '操作失败，请重试', true); }
  });
}
export function toast(text, error = false) {
  let box = $('#demo-toast');
  if (!box) {
    box = document.createElement('div'); box.id = 'demo-toast'; box.className = 'demo-toast'; box.setAttribute('role', 'status'); document.body.append(box);
  }
  const dialog = $('#demo-dialog');
  if (dialog?.open && box.parentElement !== dialog) dialog.append(box);
  else if (!dialog && box.parentElement !== document.body) document.body.append(box);
  box.textContent = text; box.dataset.error = String(error); box.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => { box.hidden = true; }, 4000);
}
export async function busy(button, fn) {
  if (button?.disabled) return;
  const html = button?.innerHTML;
  if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); button.innerHTML = icon('progress_activity') + '处理中...'; }
  try {
    await new Promise(r => setTimeout(r, 240));
    if (!navigator.onLine) throw new Error('网络已断开，请检查连接后重试，数据尚未提交');
    return await fn();
  } finally {
    if (button?.isConnected) { button.disabled = false; button.removeAttribute('aria-busy'); button.innerHTML = html; }
  }
}
let lastFocus;
export function closeModal() {
  const dlg = $('#demo-dialog');
  if (dlg) {
    const message = $('#demo-toast', dlg);
    if (message) document.body.append(message);
    dlg.close(); dlg.remove(); lastFocus?.focus?.();
  }
}
export function modal(title, content, actions = []) {
  closeModal(); lastFocus = document.activeElement;
  const dlg = document.createElement('dialog');
  dlg.id = 'demo-dialog'; dlg.className = 'demo-dialog';
  dlg.setAttribute('aria-labelledby', 'dialog-title');
  dlg.innerHTML = `<header><h2 id="dialog-title">${escape(title)}</h2><button type="button" class="demo-icon" aria-label="关闭">${icon('close')}</button></header><div class="demo-dialog-body">${content}</div><footer></footer>`;
  document.body.append(dlg);
  bind($('header button', dlg), '关闭弹窗', closeModal);
  for (const action of actions) {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'demo-button' + (action.secondary ? ' secondary' : '');
    btn.textContent = action.label; btn.disabled = !!action.disabled;
    $('footer', dlg).append(btn);
    bind(btn, action.label, () => action.run(btn));
  }
  dlg.addEventListener('click', e => { if (e.target === dlg && (e.offsetX < 0 || e.offsetX > dlg.offsetWidth || e.offsetY < 0 || e.offsetY > dlg.offsetHeight)) closeModal(); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeModal(); });
  dlg.showModal();
  return dlg;
}
export function confirm(title, body, onConfirm, options = {}) {
  return modal(title, `<p>${escape(body)}</p>`, [
    { label: '取消', secondary: true, run: closeModal },
    { label: options.label || '确认', run: btn => busy(btn, async () => { const result = await onConfirm(); closeModal(); options.after?.(result); }) }
  ]);
}
export function field(name, title, value = '', options = {}) {
  const attrs = `name="${escape(name)}" aria-label="${escape(title)}" ${options.required === false ? '' : 'required'} ${options.min != null ? `min="${escape(options.min)}"` : ''} ${options.max != null ? `max="${escape(options.max)}"` : ''}`;
  let input;
  if (options.choices) input = `<select ${attrs}>${options.choices.map(c => { const [val, text] = Array.isArray(c) ? c : [c, c]; return `<option value="${escape(val)}" ${String(value) === String(val) ? 'selected' : ''}>${escape(text)}</option>`; }).join('')}</select>`;
  else if (options.type === 'textarea') input = `<textarea ${attrs} maxlength="${options.maxLength || 1000}" rows="4">${escape(value)}</textarea>`;
  else input = `<input ${attrs} type="${options.type || 'text'}" value="${escape(value)}" ${options.step ? `step="${options.step}"` : ''} ${options.pattern ? `pattern="${escape(options.pattern)}"` : ''} autocomplete="off">`;
  return `<label class="demo-field"><span>${escape(title)}</span>${input}</label>`;
}
export function formModal(title, fields, onSubmit, buttonText = '确认提交') {
  let dlg;
  const submit = btn => {
    const form = $('form', dlg);
    if (!form.reportValidity()) return;
    return busy(btn, async () => {
      const values = Object.fromEntries(new FormData(form));
      const result = await onSubmit(values);
      if (dlg.isConnected && result !== false) closeModal();
    }).catch(error => {
      if (dlg.isConnected) $('.demo-form-error', dlg).textContent = error.message;
      toast(error.message, true);
    });
  };
  dlg = modal(title, `<form class="demo-form">${fields}<p class="demo-form-error" role="alert"></p><button type="submit" hidden></button></form>`, [
    { label: '取消', secondary: true, run: closeModal }, { label: buttonText, run: submit }
  ]);
  $('form', dlg).addEventListener('submit', e => { e.preventDefault(); submit($('footer button:last-child', dlg)).catch(error => { $('.demo-form-error', dlg).textContent = error.message; }); });
  return dlg;
}
export function active(elements, selected) {
  for (const el of elements) {
    el.setAttribute('aria-pressed', String(el === selected));
    el.classList.toggle('demo-selected', el === selected);
    if (el !== selected) el.classList.remove('bg-primary', 'text-on-primary', 'bg-primary-container', 'text-on-primary-container', 'bg-surface-container-lowest', 'shadow-sm');
  }
}
export function download(filename, data, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csv(filename, rows) {
  download(filename, '\uFEFF' + rows.map(row => row.map(v => `"${String(v ?? '').replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
}
export function empty(text = '暂无记录') { return `<p class="demo-empty">${icon('inbox')}${escape(text)}</p>`; }
export function list(items, render) { return items.length ? `<div class="demo-list">${items.map(render).join('')}</div>` : empty(); }
