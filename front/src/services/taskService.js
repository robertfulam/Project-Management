import api from './api';

export const taskService = {
  // Get user's tasks
  getUserTasks: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const response = await api.get('/tasks/user');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      throw error.response?.data || error.message;
    }
  },

  // Get all tasks (admin only)
  getAllTasks: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }
      const response = await api.get('/tasks/all');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
      throw error.response?.data || error.message;
    }
  },

  // Get task by ID
  getTaskById: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create task
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update task
  updateTask: async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Complete task
  completeTask: async (id) => {
    try {
      const response = await api.put(`/tasks/${id}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete task
  deleteTask: async (id) => {
    try {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Assign task to users (admin only)
  assignTask: async (taskData) => {
    try {
      const response = await api.post('/admin/assign-task', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};