import { apiRequest } from './client.js';

export const listPropertyCompanies = () => apiRequest('/property-companies');
export const currentPropertyCompany = () => apiRequest('/property-companies/current');
