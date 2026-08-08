import api from './axios';

export const getDashboardMetrics = () => api.get('/reports/dashboard/');
export const getTodayOperations = () => api.get('/reports/today/');
export const getRevenue = (params) => api.get('/reports/revenue/', { params });
export const getRentalActivity = (params) => api.get('/reports/rental-activity/', { params });
export const getTopProducts = () => api.get('/reports/top-products/');
export const getOverdueReport = () => api.get('/reports/overdue/');
export const getDepositSummary = () => api.get('/reports/deposits/');
