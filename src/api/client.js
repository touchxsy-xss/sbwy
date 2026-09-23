const defaultBaseUrl = 'http://localhost:3001/api/v1';

export class ApiError extends Error {
  constructor(message, { status, code, details, requestId } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export function apiBaseUrl() {
  return (globalThis.__SHENGBIAN_API_BASE__ || defaultBaseUrl).replace(/\/$/, '');
}

function cookie(name) {
  return document.cookie.split('; ').find(item => item.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}

function requestId() {
  return globalThis.crypto?.randomUUID?.() || `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function apiRequest(path, options = {}) {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('X-Request-Id', requestId());
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    options = { ...options, body: JSON.stringify(options.body) };
  }
  const csrf = cookie('sb_csrf');
  if (csrf && !['GET', 'HEAD', 'OPTIONS'].includes(method)) headers.set('X-CSRF-Token', decodeURIComponent(csrf));
  const response = await fetch(`${apiBaseUrl()}${path}`, { ...options, method, headers, credentials: 'include' });
  let payload = null;
  try { payload = await response.json(); } catch { /* non-JSON response */ }
  if (!response.ok) {
    const error = payload?.error || {};
    if (response.status === 401) globalThis.dispatchEvent?.(new CustomEvent('shengbian:api-unauthorized'));
    throw new ApiError(error.message || `请求失败（${response.status}）`, { status: response.status, code: error.code, details: error.details, requestId: payload?.meta?.requestId });
  }
  return payload?.data;
}
