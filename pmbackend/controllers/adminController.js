const Task = require('../models/Task');
const User = require('../models/User');
const Category = require('../models/Category');
const Submission = require('../models/Submission');

const assignTaskToUsers = async (req, res) => {
  try {
    const { title, description, category, dueDate, assignedTo, assignToAll } = req.body;
    
    let users = [];
    
    if (assignToAll) {
      users = await User.find({ role: 'user' });
    } else if (assignedTo && assignedTo.length > 0) {
      users = await User.find({ _id: { $in: assignedTo } });
    } else {
      return res.status(400).json({ message: 'Please specify users to assign the task to' });
    }
    
    const tasks = [];
    for (const user of users) {
      const task = await Task.create({
        title,
        description,
        category,
        assignedTo: user._id,
        assignedBy: req.user._id,
        dueDate,
        status: 'pending',
      });
      tasks.push(task);
    }
    
    const populatedTasks = await Task.find({ _id: { $in: tasks.map(t => t._id) } })
      .populate('category', 'name')
      .populate('assignedTo', 'name email');
    
    res.status(201).json({ 
      message: `Task assigned to ${users.length} users successfully`,
      tasks: populatedTasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('task', 'title description')
      .populate('user', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { adminFeedback, status } = req.body;
    
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    if (adminFeedback) submission.adminFeedback = adminFeedback;
    if (status) submission.status = status;
    
    await submission.save();
    
    // If submission is approved, mark the task as completed
    if (status === 'approved') {
      await Task.findByIdAndUpdate(submission.task, { status: 'completed' });
    }
    
    res.json({ message: 'Submission reviewed successfully', submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments({ isDeleted: false });
    const completedTasks = await Task.countDocuments({ status: 'completed', isDeleted: false });
    const pendingSubmissions = await Submission.countDocuments({ status: 'pending' });
    
    res.json({
      totalUsers,
      totalTasks,
      completedTasks,
      pendingSubmissions,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  assignTaskToUsers,
  getAllSubmissions,
  reviewSubmission,
  getAllUsers,
  getAdminStats,
};