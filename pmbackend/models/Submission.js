const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  submissionType: {
    type: String,
    enum: ['video', 'audio', 'pdf', 'text'],
    required: true,
  },
  content: {
    type: String, // URL for files, text content for text submissions
    required: true,
  },
  aiFeedback: {
    type: String,
  },
  adminFeedback: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'rejected'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);