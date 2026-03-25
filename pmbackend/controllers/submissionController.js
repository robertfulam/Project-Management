const Submission = require('../models/Submission');
const Task = require('../models/Task');
const cloudinary = require('../config/cloudinary');

const createSubmission = async (req, res) => {
  try {
    const { taskId, submissionType, content } = req.body;
    
    const task = await Task.findById(taskId);
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user already submitted
    const existingSubmission = await Submission.findOne({ task: taskId, user: req.user._id });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this task' });
    }
    
    const submission = await Submission.create({
      task: taskId,
      user: req.user._id,
      submissionType,
      content,
      status: 'pending',
    });
    
    // Update task status to in-progress
    if (task.status === 'pending') {
      task.status = 'in-progress';
      await task.save();
    }
    
    const populatedSubmission = await Submission.findById(submission._id)
      .populate('task', 'title description')
      .populate('user', 'name email');
    
    res.status(201).json(populatedSubmission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('task', 'title description dueDate')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('task', 'title description')
      .populate('user', 'name email');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    // Check if user owns the submission or is admin
    if (submission.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    if (submission.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own submissions' });
    }
    
    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update a reviewed submission' });
    }
    
    const { content } = req.body;
    submission.content = content || submission.content;
    await submission.save();
    
    res.json({ message: 'Submission updated successfully', submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
    });
    
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

module.exports = {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  updateSubmission,
  uploadFile,
};