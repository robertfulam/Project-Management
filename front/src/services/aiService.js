import api from './api';

export const aiService = {
  // General chat
  chat: async (message, type = 'chat', contextId = null) => {
    try {
      const response = await api.post('/ai/chat', { 
        message, 
        type,
        contextId 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Summarize a task
  summarizeTask: async (taskId) => {
    try {
      const response = await api.post(`/ai/summarize/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get monetization advice for a task
  monetizeTask: async (taskId) => {
    try {
      const response = await api.post(`/ai/monetize/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Assess a submission
  assessSubmission: async (submissionId) => {
    try {
      const response = await api.post(`/ai/assess/${submissionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get chat history
  getChatHistory: async () => {
    try {
      const response = await api.get('/ai/chats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};