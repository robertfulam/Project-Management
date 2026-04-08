const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const User = require('../models/User');
const Task = require('../models/Task');
const Category = require('../models/Category');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const user = await User.create({ name, email, password, role: role || 'user' });
    
    res.status(201).json({
      success: true,
      message: 'User created',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User updated',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent deleting last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the last admin' });
      }
    }
    
    await user.deleteOne();
    
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ success: true, message: 'Role updated', user: { _id: user._id, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// TASK MANAGEMENT
// ============================================

// Assign task to users
router.post('/assign-task', async (req, res) => {
  try {
    const { title, description, category, dueDate, assignedTo, assignToAll, includeSelf, priority, urgency, difficulty, tags } = req.body;
    
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
      return res.status(400).json({ success: false, message: 'Please select users' });
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
    
    res.status(201).json({
      success: true,
      message: `Task assigned to ${usersToAssign.length} users`,
      tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// STATISTICS
// ============================================

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments({ isDeleted: false });
    const completedTasks = await Task.countDocuments({ status: 'completed', isDeleted: false });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await Task.countDocuments({
      status: 'completed',
      completedAt: { $gte: today },
      isDeleted: false
    });
    
    const totalCategories = await Category.countDocuments();
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTasks,
        completedTasks,
        completedToday,
        totalCategories,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// SUBMISSIONS (if you have Submission model)
// ============================================

// Get all submissions
router.get('/submissions', async (req, res) => {
  try {
    const Submission = require('../models/Submission');
    const submissions = await Submission.find()
      .populate('task', 'title')
      .populate('user', 'name email')
      .sort({ submittedAt: -1 });
    
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Review submission
router.put('/submissions/:id/review', async (req, res) => {
  try {
    const { status, adminFeedback, score } = req.body;
    const Submission = require('../models/Submission');
    
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    
    submission.status = status;
    submission.adminFeedback = adminFeedback;
    if (score) submission.score = score;
    submission.reviewedAt = new Date();
    submission.reviewedBy = req.user._id;
    
    await submission.save();
    
    res.json({ success: true, message: 'Submission reviewed', submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;