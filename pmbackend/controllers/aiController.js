const OpenAI = require('openai');
const Chat = require('../models/Chat');
const Task = require('../models/Task');
const Submission = require('../models/Submission');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// General AI chat
const aiChat = async (req, res) => {
  try {
    const { message, type, contextId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    
    let systemPrompt = '';
    let contextContent = '';
    
    switch(type) {
      case 'summarize':
        systemPrompt = 'You are an AI assistant that summarizes tasks and content. Provide concise, clear summaries with key takeaways.';
        if (contextId) {
          const task = await Task.findById(contextId);
          if (task) {
            contextContent = `\n\nTask to summarize:\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nDue Date: ${task.dueDate}`;
          }
        }
        break;
      case 'monetize':
        systemPrompt = 'You are an AI assistant that helps monetize content and tasks. Provide practical monetization strategies, revenue opportunities, and actionable advice.';
        if (contextId) {
          const task = await Task.findById(contextId);
          if (task) {
            contextContent = `\n\nTask to monetize:\nTitle: ${task.title}\nDescription: ${task.description}`;
          }
        }
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant for task management. Help users with their tasks, provide suggestions, and assist with productivity.';
    }
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message + contextContent }
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Save chat history
    let chat = await Chat.findOne({ user: req.user._id, type });
    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        type,
        messages: []
      });
    }
    
    chat.messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() }
    );
    await chat.save();
    
    res.json({ 
      success: true, 
      response: aiResponse, 
      chatId: chat._id 
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI service error', 
      error: error.message 
    });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Summarize a specific task
const summarizeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant that summarizes tasks. Provide a concise, clear summary with key points.' },
        { role: 'user', content: `Summarize this task:\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nDue Date: ${task.dueDate}` }
      ],
      max_tokens: 300,
    });
    
    res.json({ success: true, response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Monetize a task
const monetizeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a monetization expert. Provide practical ways to monetize this task or its outcomes.' },
        { role: 'user', content: `How can I monetize this task?\nTask: ${task.title}\nDescription: ${task.description}` }
      ],
      max_tokens: 400,
    });
    
    res.json({ success: true, response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Monetize error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Analyze uploaded file
const analyzeFile = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // For text files, extract content
    let fileContent = '';
    if (file.buffer) {
      fileContent = file.buffer.toString('utf-8').substring(0, 3000);
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an AI assistant that analyzes files and provides summaries and insights.' },
        { role: 'user', content: `Please analyze this file and provide a summary, key points, and actionable insights:\n\n${fileContent}` }
      ],
      max_tokens: 500,
    });
    
    res.json({ success: true, summary: completion.choices[0].message.content });
  } catch (error) {
    console.error('File analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { aiChat, getChatHistory, summarizeTask, monetizeTask, analyzeFile };