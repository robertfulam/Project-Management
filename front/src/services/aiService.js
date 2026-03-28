import api from './api';

export const aiService = {
  // General chat
  chat: async (message, type = 'chat') => {
    try {
      const response = await api.post('/ai/chat', { 
        message, 
        type 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Summarize a task
  summarizeTask: async (taskId) => {
    try {
      const response = await api.post('/ai/chat', {
        message: `Please summarize this task and provide key insights.`,
        type: 'summarize',
        contextId: taskId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get monetization advice for a task
  monetizeTask: async (taskId) => {
    try {
      const response = await api.post('/ai/chat', {
        message: `Please provide monetization strategies and opportunities for this task.`,
        type: 'monetize',
        contextId: taskId
      });
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