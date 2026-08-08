import api from './axios';

export const getInvoices = (params) => api.get('/invoices/', { params });
export const getInvoice = (id) => api.get(`/invoices/${id}/`);
export const downloadInvoice = (id) => api.get(`/invoices/${id}/download/`, { responseType: 'blob' });
