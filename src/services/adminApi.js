import api from './api';

const adminApi = {
  // Dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // User management
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUser: async (userId, updates) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Analytics
  getAnalytics: async (timeRange = '7d') => {
    try {
      const response = await api.get('/admin/analytics', {
        params: { range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // System status
  getSystemStatus: async () => {
    try {
      const response = await api.get('/admin/system-status');
      return response.data;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  },

  // Broadcast notifications
  sendBroadcast: async (broadcastData) => {
    try {
      const response = await api.post('/admin/broadcast', broadcastData);
      return response.data;
    } catch (error) {
      console.error('Error sending broadcast:', error);
      throw error;
    }
  },

  // System logs
  getLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
};

export default adminApi; 