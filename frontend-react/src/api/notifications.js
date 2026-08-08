import api from './axios';

export const getNotifications = (params) => api.get('/notifications/', { params });
export const markRead = (id) => api.post(`/notifications/${id}/read/`);
export const markAllRead = () => api.post('/notifications/read-all/');
