import api from './axios';

export const getPickups = (params) => api.get('/pickups/', { params });
export const confirmPickup = (id) => api.post(`/pickups/${id}/confirm/`);
export const getReturns = (params) => api.get('/returns/', { params });
export const confirmReturn = (id, data) => api.post(`/returns/${id}/confirm/`, data);
export const createInspection = (data) => api.post('/inspections/', data);
export const createDamageReport = (data) => api.post('/damage-reports/', data);
export const getLateFeesConfig = () => api.get('/latefees/config/');
export const updateLateFeesConfig = (id, data) => api.put(`/latefees/config/${id}/`, data);
