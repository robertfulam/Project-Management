const OpenAI = require('openai');
const Chat = require('../models/Chat');
const Task = require('../models/Task');
const Submission = require('../models/Submission');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// General AI chat
const aiChat = async (req, res) => {
  try {
    const { message, type, contextId } = req.body;
    let systemPrompt = '';
    
    switch(type) {
      case 'summarize':
        systemPrompt = 'You are an AI assistant that summarizes tasks and content. Provide concise, clear summaries with key takeaways.';
        break;
      case 'monetize':
        systemPrompt = 'You are an AI assistant that helps monetize content and tasks. Provide practical monetization strategies, revenue opportunities, and actionable advice.';
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant for task management. Help users with their tasks, provide suggestions, and assist with productivity.';
    }
    
    let contextContent = '';
    if (contextId && type === 'summarize') {
      const task = await Task.findById(contextId);
      if (task) {
        contextContent = `\n\nTask to summarize:\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nDue Date: ${task.dueDate}`;
      }
      
      const submission = await Submission.findById(contextId).populate('task');
      if (submission) {
        contextContent = `\n\nSubmission to summarize:\nContent: ${submission.content}\nTask: ${submission.task.title}`;
      }
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
    
    let chat = await Chat.findOne({ user: req.user._id, type });
    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        type,
        messages: []
      });
    }
    
    chat.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    );
    await chat.save();
    
    res.json({ response: aiResponse, chatId: chat._id });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Summarize a specific task
const summarizeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const messages = [
      { role: 'system', content: 'You are an AI assistant that summarizes tasks. Provide a concise, clear summary with key points.' },
      { role: 'user', content: `Summarize this task:\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nDue Date: ${task.dueDate}` }
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 300,
    });
    
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Monetize a task
const monetizeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const messages = [
      { role: 'system', content: 'You are a monetization expert. Provide practical ways to monetize this task or its outcomes.' },
      { role: 'user', content: `How can I monetize this task?\nTask: ${task.title}\nDescription: ${task.description}` }
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 400,
    });
    
    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Analyze uploaded file
const analyzeFile = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Extract text from file (simplified for now)
    const fileContent = file.buffer ? file.buffer.toString('utf-8') : 'File content';
    
    const messages = [
      { role: 'system', content: 'You are an AI assistant that analyzes files and provides summaries and insights.' },
      { role: 'user', content: `Please analyze this file and provide a summary, key points, and actionable insights:\n\n${fileContent.substring(0, 2000)}` }
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
    });
    
    res.json({ summary: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { aiChat, getChatHistory, summarizeTask, monetizeTask, analyzeFile };