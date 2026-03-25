const Task = require('../models/Task');
const Category = require('../models/Category');

const createTask = async (req, res) => {
  try {
    const { title, description, category, assignedTo, dueDate } = req.body;
    
    const task = await Task.create({
      title,
      description,
      category,
      assignedTo,
      assignedBy: req.user._id,
      dueDate,
      status: 'pending',
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('category', 'name')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, category, assignedTo } = req.query;
    const filter = { isDeleted: false };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    const tasks = await Task.find(filter)
      .populate('category', 'name description')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('category', 'name description')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');
    
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const { title, description, category, dueDate, status } = req.body;
    
    task.title = title || task.title;
    task.description = description || task.description;
    task.category = category || task.category;
    task.dueDate = dueDate || task.dueDate;
    
    if (status) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
      }
    }
    
    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id)
      .populate('category', 'name')
      .populate('assignedTo', 'name email');
    
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.isDeleted = true;
    await task.save();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task || task.isDeleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();
    
    res.json({ message: 'Task marked as completed', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  getUserTasks,
};