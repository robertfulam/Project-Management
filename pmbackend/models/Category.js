const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#6366f1',
  },
  icon: {
    type: String,
    default: '📁',
  },
}, {
  timestamps: true,
});

// Ensure unique category names per user
categorySchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);