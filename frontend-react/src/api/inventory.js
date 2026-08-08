import api from './axios';

export const getInventory = (params) => api.get('/inventory/', { params });
export const getInventoryItem = (id) => api.get(`/inventory/${id}/`);
export const updateInventoryItem = (id, data) => api.put(`/inventory/${id}/`, data);
export const createInventoryItem = (data) => api.post('/inventory/', data);
export const updateInventoryStatus = (id, data) => api.post(`/inventory/${id}/update_status/`, data);
