const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['chat', 'summarize', 'monetize'],
    default: 'chat'
  },
  messages: [messageSchema],
  title: {
    type: String,
    default: 'New Conversation'
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);