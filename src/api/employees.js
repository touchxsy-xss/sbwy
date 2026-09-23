import { apiRequest } from './client.js';

export const listEmployees = () => apiRequest('/employees');
export const getEmployee = id => apiRequest(`/employees/${encodeURIComponent(id)}`);
