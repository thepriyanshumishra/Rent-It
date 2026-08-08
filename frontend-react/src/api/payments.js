import api from './axios';

export const createPayment = (data) => api.post('/payments/create/', data);
export const verifyPayment = (data) => api.post('/payments/verify/', data);
export const getPayments = (params) => api.get('/payments/', { params });
export const getPayment = (id) => api.get(`/payments/${id}/`);
