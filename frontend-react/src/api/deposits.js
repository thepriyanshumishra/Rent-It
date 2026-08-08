import api from './axios';

export const getDeposits = (params) => api.get('/deposits/', { params });
export const getDeposit = (id) => api.get(`/deposits/${id}/`);
export const settleDeposit = (id, data) => api.post(`/deposits/${id}/settle/`, data);
