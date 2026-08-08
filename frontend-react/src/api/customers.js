import api from './axios';

export const getCustomers = (params) => api.get('/auth/customers/', { params });
export const getCustomer = (id) => api.get(`/auth/customers/${id}/`);
export const updateCustomer = (id, data) => api.put(`/auth/customers/${id}/`, data);
