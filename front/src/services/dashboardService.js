import api from './api';

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get My Todo tasks
  getMyTodo: async () => {
    try {
      const response = await api.get('/dashboard/mytodo');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get completed tasks
  getCompleted: async () => {
    try {
      const response = await api.get('/dashboard/complete');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending tasks
  getPending: async () => {
    try {
      const response = await api.get('/dashboard/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get in-progress tasks
  getProgress: async () => {
    try {
      const response = await api.get('/dashboard/progress');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};