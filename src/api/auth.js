import { apiRequest } from './client.js';

export const login = (phone, password) => apiRequest('/auth/login', { method: 'POST', body: { phone, password } });
export const logout = () => apiRequest('/auth/logout', { method: 'POST' });
export const currentUser = () => apiRequest('/auth/me');
export const sessions = () => apiRequest('/auth/sessions');
export const revokeSession = id => apiRequest(`/auth/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
