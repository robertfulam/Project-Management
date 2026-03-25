const Task = require('../models/Task');
const Submission = require('../models/Submission');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const stats = {
      dashboard: {},
      myTodo: {},
      complete: {},
      pending: {},
      progress: {}
    };
    
    // Dashboard stats
    const allTasks = await Task.find({ assignedTo: userId, isDeleted: false });
    stats.dashboard.totalTasks = allTasks.length;
    stats.dashboard.completedTasks = allTasks.filter(t => t.status === 'completed').length;
    stats.dashboard.pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    stats.dashboard.inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
    
    // My Todo (pending tasks)
    const todoTasks = await Task.find({ 
      assignedTo: userId, 
      status: 'pending',
      isDeleted: false 
    }).populate('category', 'name').sort({ dueDate: 1 });
    stats.myTodo.tasks = todoTasks;
    stats.myTodo.count = todoTasks.length;
    
    // Completed tasks
    const completedTasks = await Task.find({ 
      assignedTo: userId, 
      status: 'completed',
      isDeleted: false 
    }).populate('category', 'name').sort({ completedAt: -1 });
    stats.complete.tasks = completedTasks;
    stats.complete.count = completedTasks.length;
    
    // Pending tasks (not completed)
    const pendingTasks = await Task.find({ 
      assignedTo: userId, 
      status: { $in: ['pending', 'in-progress'] },
      isDeleted: false 
    }).populate('category', 'name').sort({ dueDate: 1 });
    stats.pending.tasks = pendingTasks;
    stats.pending.count = pendingTasks.length;
    
    // In-progress tasks
    const progressTasks = await Task.find({ 
      assignedTo: userId, 
      status: 'in-progress',
      isDeleted: false 
    }).populate('category', 'name').sort({ dueDate: 1 });
    stats.progress.tasks = progressTasks;
    stats.progress.count = progressTasks.length;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyTodo = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user._id, 
      status: 'pending',
      isDeleted: false 
    }).populate('category', 'name').sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCompleteTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user._id, 
      status: 'completed',
      isDeleted: false 
    }).populate('category', 'name').sort({ completedAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user._id, 
      status: { $in: ['pending', 'in-progress'] },
      isDeleted: false 
    }).populate('category', 'name').sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProgressTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ 
      assignedTo: req.user._id, 
      status: 'in-progress',
      isDeleted: false 
    }).populate('category', 'name').sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getMyTodo,
  getCompleteTasks,
  getPendingTasks,
  getProgressTasks,
};