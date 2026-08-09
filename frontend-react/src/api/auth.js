import api from './axios';

export const register = (data) => api.post('/auth/register/', data);
export const registerVendor = (data) => api.post('/auth/register-vendor/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const login = (data) => api.post('/auth/login/', data);
export const logout = (data) => api.post('/auth/logout/', data);
export const refreshToken = (refresh) => api.post('/auth/refresh/', { refresh });
export const getProfile = () => api.get('/auth/profile/');
export const updateProfile = (data) => api.put('/auth/profile/', data);
export const changePassword = (data) => api.post('/auth/change-password/', data);
export const getAddresses = () => api.get('/auth/addresses/');
export const addAddress = (data) => api.post('/auth/addresses/', data);
export const updateAddress = (id, data) => api.put(`/auth/addresses/${id}/`, data);
export const deleteAddress = (id) => api.delete(`/auth/addresses/${id}/`);
