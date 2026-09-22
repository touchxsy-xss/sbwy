import { apiRequest } from './client.js';

export const listRoles = () => apiRequest('/roles');
export const listPermissions = () => apiRequest('/permissions');
export const listUserRoles = userId => apiRequest(`/users/${encodeURIComponent(userId)}/roles`);
