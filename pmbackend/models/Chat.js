const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  type: {
    type: String,
    enum: ['summarize', 'monetize', 'chat'],
    default: 'chat',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Chat', chatSchema);