import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !token.includes('mock-')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - clear auth and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Devices API
export const devicesAPI = {
  getAll: () => api.get('/devices'),
  getById: (id) => api.get(`/devices/${id}`),
  create: (device) => api.post('/devices', device),
  update: (id, device) => api.put(`/devices/${id}`, device),
  updateStatus: (id, status) => api.patch(`/devices/${id}/status`, { status }),
  delete: (id) => api.delete(`/devices/${id}`),
};

// Alerts API
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  markAsRead: (id) => api.patch(`/alerts/${id}/read`),
  markAsResolved: (id) => api.patch(`/alerts/${id}/resolved`),
  getStats: () => api.get('/alerts/stats'),
};

// Logs API
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getByDevice: (deviceId, params) => api.get(`/logs/device/${deviceId}`, { params }),
};

// Policies API
export const policiesAPI = {
  getAll: () => api.get('/policies'),
  getById: (id) => api.get(`/policies/${id}`),
  create: (policy) => api.post('/policies', policy),
  update: (id, policy) => api.put(`/policies/${id}`, policy),
  delete: (id) => api.delete(`/policies/${id}`),
  deploy: (id, deviceIds) => api.post(`/policies/${id}/deploy`, { deviceIds }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentAlerts: () => api.get('/dashboard/recent-alerts'),
  getDeviceStatus: () => api.get('/dashboard/device-status'),
};

export default api;

