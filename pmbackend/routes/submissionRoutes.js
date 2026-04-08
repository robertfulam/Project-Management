const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const Submission = require('../models/Submission');
const Task = require('../models/Task');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================
// USER SUBMISSIONS
// ============================================

// Create submission
router.post('/', async (req, res) => {
  try {
    const { taskId, content, submissionType } = req.body;
    
    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    // Check if user is assigned to this task
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Check if already submitted
    const existing = await Submission.findOne({ task: taskId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already submitted' });
    }
    
    const submission = await Submission.create({
      task: taskId,
      user: req.user._id,
      content,
      submissionType: submissionType || 'text',
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Submission created',
      submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my submissions
router.get('/my', async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('task', 'title description')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single submission
router.get('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('task', 'title description')
      .populate('user', 'name email');
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Check permission
    if (submission.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update submission
router.put('/:id', async (req, res) => {
  try {
    const { content } = req.body;
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Check ownership
    if (submission.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    // Can't update if already reviewed
    if (submission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot update after review' });
    }
    
    submission.content = content;
    await submission.save();
    
    res.json({ success: true, message: 'Submission updated', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete submission
router.delete('/:id', async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    // Check permission
    if (submission.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    await submission.deleteOne();
    
    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// ADMIN SUBMISSIONS
// ============================================

// Get all submissions (admin only)
router.get('/admin/all', adminOnly, async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('task', 'title description')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Review submission (admin only)
router.put('/admin/:id/review', adminOnly, async (req, res) => {
  try {
    const { status, feedback, score } = req.body;
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    submission.status = status;
    submission.adminFeedback = feedback;
    if (score) submission.score = score;
    submission.reviewedAt = new Date();
    submission.reviewedBy = req.user._id;
    
    await submission.save();
    
    // If approved, mark task as completed
    if (status === 'approved') {
      await Task.findByIdAndUpdate(submission.task, { 
        status: 'completed',
        completedAt: new Date()
      });
    }
    
    res.json({ success: true, message: 'Submission reviewed', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;