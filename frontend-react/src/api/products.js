import api from './axios';

export const getProducts = (params) => api.get('/products/', { params });
export const getProduct = (slug) => api.get(`/products/${slug}/`);
export const checkAvailability = (id, data) => api.post(`/products/${id}/check_availability/`, data);
export const searchProducts = (query) => api.get('/products/', { params: { search: query } });
