const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');

// Get user's tasks
const getUserTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { 
      assignedTo: req.user._id, 
      isDeleted: false 
    };
    
    if (status) filter.status = status;
    
    const tasks = await Task.find(filter)
      .populate('category', 'name')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tasks (admin only)
const getAllTasks = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const tasks = await Task.find({ isDeleted: false })
      .populate('category', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }
    
    const task = await Task.findById(id)
      .populate('category', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if user has access to this task
    if (task.assignedTo._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create task (admin only)
const createTask = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create tasks' });
    }
    
    const { title, description, category, assignedTo, dueDate, priority, urgency, difficulty, tags } = req.body;
    
    // Validate assignedTo ObjectId
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const task = await Task.create({
      title,
      description,
      category,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
      priority: priority || 'medium',
      urgency: urgency || 'moderate',
      difficulty: difficulty || 'medium',
      tags: tags || [],
      status: 'pending'
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('category', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update task (admin only)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update tasks' });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }
    
    const task = await Task.findById(id);
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const { title, description, category, dueDate, status, priority, urgency, difficulty, tags, progress } = req.body;
    
    task.title = title || task.title;
    task.description = description || task.description;
    task.category = category || task.category;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.urgency = urgency || task.urgency;
    task.difficulty = difficulty || task.difficulty;
    task.tags = tags || task.tags;
    task.progress = progress || task.progress;
    
    if (status) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      }
    }
    
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('category', 'name')
      .populate('assignedTo', 'name email');
    
    res.json(populatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Complete task (users can complete their own tasks)
const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }
    
    const task = await Task.findById(id);
    
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.assignedTo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to complete this task' });
    }
    
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();
    
    res.json({ message: 'Task completed successfully', task });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete task (admin only)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID format' });
    }
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.isDeleted = true;
    await task.save();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign task to users (admin only)
const assignTaskToUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign tasks' });
    }
    
    const { title, description, category, dueDate, assignedTo, assignToAll, includeSelf, priority, urgency, difficulty, tags } = req.body;
    
    let usersToAssign = [];
    
    if (assignToAll) {
      let query = { role: 'user' };
      if (!includeSelf) {
        query = { role: 'user', _id: { $ne: req.user._id } };
      }
      usersToAssign = await User.find(query);
    } else if (assignedTo && assignedTo.length > 0) {
      // Validate each assignedTo ID
      const validIds = assignedTo.filter(id => mongoose.Types.ObjectId.isValid(id));
      usersToAssign = await User.find({ _id: { $in: validIds } });
    } else {
      return res.status(400).json({ message: 'Please specify users to assign the task to' });
    }
    
    const tasks = [];
    for (const user of usersToAssign) {
      const task = await Task.create({
        title,
        description,
        category,
        assignedTo: user._id,
        assignedBy: req.user._id,
        dueDate,
        priority: priority || 'medium',
        urgency: urgency || 'moderate',
        difficulty: difficulty || 'medium',
        tags: tags || [],
        status: 'pending'
      });
      tasks.push(task);
    }
    
    const populatedTasks = await Task.find({ _id: { $in: tasks.map(t => t._id) } })
      .populate('category', 'name')
      .populate('assignedTo', 'name email');
    
    res.status(201).json({ 
      message: `Task assigned to ${usersToAssign.length} users successfully`,
      tasks: populatedTasks
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get submissions (admin only)
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

// Review submission (admin only)
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
    
    if (status === 'approved') {
      await Task.findByIdAndUpdate(submission.task, { status: 'completed' });
    }
    
    res.json({ message: 'Submission reviewed successfully', submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUserTasks,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  assignTaskToUsers,
  getAllSubmissions,
  reviewSubmission
};