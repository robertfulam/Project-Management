const Submission = require('../models/Submission');
const Task = require('../models/Task');
const mongoose = require('mongoose');

// @desc    Create a new submission
// @route   POST /api/submissions
// @access  Private
const createSubmission = async (req, res) => {
  try {
    const { taskId, submissionType, content, fileUrl, fileName, fileType } = req.body;

    // Validate required fields
    if (!taskId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Task ID is required' 
      });
    }
    if (!content && !fileUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content or file URL is required' 
      });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Check if user is assigned to this task
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to submit for this task' 
      });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({ 
      task: taskId, 
      user: req.user._id 
    });
    
    if (existingSubmission) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted for this task' 
      });
    }

    const submission = await Submission.create({
      task: taskId,
      user: req.user._id,
      submissionType: submissionType || 'text',
      content: content || '',
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileType: fileType || null,
      status: 'pending'
    });

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('task', 'title description dueDate')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Submission created successfully',
      submission: populatedSubmission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's submissions
// @route   GET /api/submissions/user
// @access  Private
const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('task', 'title description dueDate priority status')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid submission ID format' 
      });
    }

    const submission = await Submission.findById(id)
      .populate('task', 'title description dueDate priority status')
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    // Check if user owns this submission or is admin
    if (submission.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this submission' 
      });
    }

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, fileUrl, fileName, fileType, submissionType } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid submission ID format' 
      });
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    // Check if user owns this submission
    if (submission.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this submission' 
      });
    }

    // Can't update if already reviewed
    if (submission.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot update submission after it has been reviewed' 
      });
    }

    // Update fields
    if (content !== undefined) submission.content = content;
    if (fileUrl !== undefined) submission.fileUrl = fileUrl;
    if (fileName !== undefined) submission.fileName = fileName;
    if (fileType !== undefined) submission.fileType = fileType;
    if (submissionType !== undefined) submission.submissionType = submissionType;

    await submission.save();

    res.json({
      success: true,
      message: 'Submission updated successfully',
      submission
    });
  } catch (error) {
    console.error('Update submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid submission ID format' 
      });
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    // Check if user owns this submission or is admin
    if (submission.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this submission' 
      });
    }

    await submission.deleteOne();

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all submissions (admin only)
// @route   GET /api/admin/submissions
// @access  Private/Admin
const getAllSubmissions = async (req, res) => {
  try {
    const { status, taskId, userId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (taskId) filter.task = taskId;
    if (userId) filter.user = userId;

    const submissions = await Submission.find(filter)
      .populate('task', 'title description dueDate priority')
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Review submission (admin only)
// @route   PUT /api/admin/submissions/:id/review
// @access  Private/Admin
const reviewSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminFeedback, score } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid submission ID format' 
      });
    }

    if (!status || !['approved', 'rejected', 'needs_revision'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status is required (approved, rejected, needs_revision)' 
      });
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    submission.status = status;
    if (adminFeedback) submission.adminFeedback = adminFeedback;
    if (score !== undefined) submission.score = Math.min(100, Math.max(0, score));
    submission.reviewedAt = new Date();
    submission.reviewedBy = req.user._id;

    await submission.save();

    // If submission is approved, mark the task as completed
    if (status === 'approved') {
      await Task.findByIdAndUpdate(submission.task, { 
        status: 'completed',
        completedAt: new Date()
      });
    }

    const populatedSubmission = await Submission.findById(id)
      .populate('task', 'title description')
      .populate('user', 'name email')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: 'Submission reviewed successfully',
      submission: populatedSubmission
    });
  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error reviewing submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get submission statistics
// @route   GET /api/submissions/stats
// @access  Private
const getSubmissionStats = async (req, res) => {
  try {
    const stats = await Submission.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const pending = stats.find(s => s._id === 'pending')?.count || 0;
    const approved = stats.find(s => s._id === 'approved')?.count || 0;
    const rejected = stats.find(s => s._id === 'rejected')?.count || 0;
    const needsRevision = stats.find(s => s._id === 'needs_revision')?.count || 0;

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        needsRevision,
        approvalRate: total > 0 ? (approved / total * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get submission stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching submission stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getAllSubmissions,
  reviewSubmission,
  getSubmissionStats
};