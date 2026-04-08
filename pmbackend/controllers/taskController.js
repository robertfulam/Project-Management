const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const Category = require('../models/Category');

// Get user's tasks (only their assigned tasks)
const getUserTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { 
      assignedTo: req.user._id, 
      isDeleted: false 
    };
    
    if (status) filter.status = status;
    
    const tasks = await Task.find(filter)
      .populate('category', 'name color icon')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });
    
    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all tasks (admin only)
const getAllTasks = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }
    
    const tasks = await Task.find({ isDeleted: false })
      .populate('category', 'name color icon')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });
    
    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid task ID format' 
      });
    }
    
    const task = await Task.findById(id)
      .populate('category', 'name color icon')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    if (!task || task.isDeleted) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    // Check access: admin OR task owner
    const isOwner = task.assignedTo._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this task' 
      });
    }
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create task - Any authenticated user can create their own task
const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      dueDate, 
      priority, 
      urgency, 
      difficulty, 
      tags,
      assignedTo 
    } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Task title is required' 
      });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Task description is required' 
      });
    }
    
    if (!category) {
      return res.status(400).json({ 
        success: false,
        message: 'Category is required' 
      });
    }
    
    // Validate category exists and user has access
    const categoryExists = await Category.findOne({
      _id: category,
      $or: [
        { createdBy: req.user._id },
        { isDefault: true }
      ]
    });
    
    if (!categoryExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid category selected' 
      });
    }
    
    // Regular users can only create tasks for themselves
    let taskAssignedTo = req.user._id;
    
    // Only admins can assign tasks to other users
    if (assignedTo && req.user.role === 'admin') {
      const targetUser = await User.findById(assignedTo);
      if (!targetUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid user selected' 
        });
      }
      taskAssignedTo = assignedTo;
    } else if (assignedTo && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can assign tasks to other users' 
      });
    }
    
    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      category,
      assignedTo: taskAssignedTo,
      assignedBy: req.user._id,
      dueDate,
      priority: priority || 'medium',
      urgency: urgency || 'moderate',
      difficulty: difficulty || 'medium',
      tags: tags || [],
      status: 'pending'
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('category', 'name color icon')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update task - Owner or admin
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid task ID format' 
      });
    }
    
    const task = await Task.findById(id);
    if (!task || task.isDeleted) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    // Check permissions: admin OR task owner
    const isOwner = task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this task' 
      });
    }
    
    const { 
      title, 
      description, 
      category, 
      dueDate, 
      status, 
      priority, 
      urgency, 
      difficulty, 
      tags, 
      progress 
    } = req.body;
    
    // If updating category, validate it
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        $or: [
          { createdBy: req.user._id },
          { isDefault: true }
        ]
      });
      
      if (!categoryExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid category selected' 
        });
      }
    }
    
    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (category) task.category = category;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (urgency) task.urgency = urgency;
    if (difficulty) task.difficulty = difficulty;
    if (tags) task.tags = tags;
    if (progress !== undefined) task.progress = Math.min(100, Math.max(0, progress));
    
    if (status) {
      task.status = status;
      if (status === 'completed' && !task.completedAt) {
        task.completedAt = new Date();
      }
    }
    
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('category', 'name color icon')
      .populate('assignedTo', 'name email');
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Complete task - Owner or admin
const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid task ID format' 
      });
    }
    
    const task = await Task.findById(id);
    
    if (!task || task.isDeleted) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    // Check permissions: admin OR task owner
    const isOwner = task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to complete this task' 
      });
    }
    
    if (task.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Task is already completed' 
      });
    }
    
    task.status = 'completed';
    task.completedAt = new Date();
    task.progress = 100;
    await task.save();
    
    res.json({ 
      success: true, 
      message: 'Task completed successfully! 🎉',
      task
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error completing task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete task - Owner or admin
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid task ID format' 
      });
    }
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Task not found' 
      });
    }
    
    // Check permissions: admin OR task owner
    const isOwner = task.assignedTo.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this task' 
      });
    }
    
    task.isDeleted = true;
    await task.save();
    
    res.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Assign task to users (admin only)
const assignTaskToUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can assign tasks to other users' 
      });
    }
    
    const { 
      title, 
      description, 
      category, 
      dueDate, 
      assignedTo, 
      assignToAll, 
      includeSelf, 
      priority, 
      urgency, 
      difficulty, 
      tags 
    } = req.body;
    
    let usersToAssign = [];
    
    if (assignToAll) {
      let query = { role: 'user' };
      if (!includeSelf) {
        query = { role: 'user', _id: { $ne: req.user._id } };
      }
      usersToAssign = await User.find(query);
    } else if (assignedTo && assignedTo.length > 0) {
      usersToAssign = await User.find({ _id: { $in: assignedTo } });
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Please specify users to assign the task to' 
      });
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
      success: true,
      message: `Task assigned to ${usersToAssign.length} users successfully`,
      tasks: populatedTasks
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error assigning task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
  assignTaskToUsers
};