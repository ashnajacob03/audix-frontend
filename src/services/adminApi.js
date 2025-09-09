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

  // Create user
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, updates) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Bulk delete users
  bulkDeleteUsers: async (userIds) => {
    try {
      const response = await api.delete('/admin/users/bulk', { data: { userIds } });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw error;
    }
  },

  // Bulk update users
  bulkUpdateUsers: async (userIds, updates) => {
    try {
      const response = await api.put('/admin/users/bulk', { userIds, updates });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating users:', error);
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

};

export default adminApi; 