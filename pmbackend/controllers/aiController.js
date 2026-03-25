const OpenAI = require('openai');
const Chat = require('../models/Chat');
const Task = require('../models/Task');
const Submission = require('../models/Submission');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiChat = async (req, res) => {
  try {
    const { message, type, contextId } = req.body;
    let systemPrompt = '';
    
    // Set system prompt based on type
    switch(type) {
      case 'summarize':
        systemPrompt = 'You are an AI assistant that summarizes tasks and content. Provide concise, clear summaries.';
        break;
      case 'monetize':
        systemPrompt = 'You are an AI assistant that helps monetize content and tasks. Provide practical monetization strategies and advice.';
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant for task management.';
    }
    
    // Get context if provided
    let contextContent = '';
    if (contextId && type === 'summarize') {
      const task = await Task.findById(contextId);
      if (task) {
        contextContent = `\n\nTask to summarize: ${task.title}\nDescription: ${task.description}`;
      }
      
      const submission = await Submission.findById(contextId).populate('task');
      if (submission) {
        contextContent = `\n\nSubmission to summarize: ${submission.content}\nTask: ${submission.task.title}`;
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

const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const assessSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId).populate('task user');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    const systemPrompt = `You are an AI assistant that assesses task submissions. 
    Evaluate the submission based on the task requirements and provide constructive feedback.`;
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Task: ${submission.task.title}\nDescription: ${submission.task.description}\n\nSubmission: ${submission.content}\n\nPlease assess this submission.` }
    ];
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
    });
    
    const aiFeedback = completion.choices[0].message.content;
    submission.aiFeedback = aiFeedback;
    await submission.save();
    
    res.json({ feedback: aiFeedback, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { aiChat, getChatHistory, assessSubmission };