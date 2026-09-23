import { apiRequest } from './client.js';

export const listCommunities = () => apiRequest('/communities');
export const getCommunity = id => apiRequest(`/communities/${encodeURIComponent(id)}`);
export const createCommunity = input => apiRequest('/communities', { method: 'POST', body: input });
export const updateCommunity = (id, input) => apiRequest(`/communities/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });
