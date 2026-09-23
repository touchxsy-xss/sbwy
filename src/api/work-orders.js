import { apiRequest, ApiError } from './client.js';

/** @typedef {'PENDING_DISPATCH'|'ASSIGNED'|'ACCEPTED'|'ARRIVED'|'COMPLETED'|'REWORK_REQUIRED'|'ARCHIVED'|'CANCELLED'} WorkOrderStatus */
/** @typedef {{ id:string, workOrderId:string, action:string, fromStatus?:WorkOrderStatus|null, toStatus:WorkOrderStatus, note?:string|null, createdAt:string }} WorkOrderEvent */

export const residentStatusLabels = Object.freeze({
  PENDING_DISPATCH: '待派单',
  ASSIGNED: '已派单',
  ACCEPTED: '维修人员已接单',
  ARRIVED: '维修人员已到场',
  COMPLETED: '待您确认',
  REWORK_REQUIRED: '返工处理中',
  ARCHIVED: '已完成',
  CANCELLED: '已取消'
});

export function apiErrorMessage(error) {
  if (!(error instanceof ApiError)) return error?.message || '网络异常，请稍后重试';
  if (error.status === 401) return '登录已失效，请重新登录';
  if (error.status === 403) return '您当前无权操作该工单';
  if (error.status === 404) return '该工单不存在或您无权查看';
  if (error.status === 409) return '工单状态已发生变化，请刷新后重试';
  if (error.status === 422) return error.message || '请检查填写内容';
  if (error.status >= 500) return '服务暂时不可用，请稍后重试';
  return error.message || '操作失败，请重试';
}

export const listWorkOrders = ({ page = 1, pageSize = 20, communityId, houseId, status, keyword } = {}) => {
  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  for (const [key, value] of Object.entries({ communityId, houseId, status, keyword })) if (value) query.set(key, value);
  return apiRequest(`/work-orders?${query}`);
};
export const getWorkOrder = id => apiRequest(`/work-orders/${encodeURIComponent(id)}`);
export const listWorkOrderEvents = id => apiRequest(`/work-orders/${encodeURIComponent(id)}/events`);
export const createWorkOrder = input => apiRequest('/work-orders', { method: 'POST', body: input });
export const confirmCompletion = id => apiRequest(`/work-orders/${encodeURIComponent(id)}/confirm-completion`, { method: 'POST', body: {} });
export const requestRework = (id, reason) => apiRequest(`/work-orders/${encodeURIComponent(id)}/request-rework`, { method: 'POST', body: { reason } });
export const submitReview = (id, input) => apiRequest(`/work-orders/${encodeURIComponent(id)}/review`, { method: 'POST', body: input });
export const getReview = id => apiRequest(`/work-orders/${encodeURIComponent(id)}/review`);

export const listResidentPeople = keyword => apiRequest(`/people?page=1&pageSize=100&keyword=${encodeURIComponent(keyword)}`);
export const listPersonRelationships = personId => apiRequest(`/people/${encodeURIComponent(personId)}/relationships`);

