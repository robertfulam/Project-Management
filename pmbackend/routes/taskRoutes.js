const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
  getUserTasks,
} = require('../controllers/taskController');

const router = express.Router();

// All task routes are protected
router.use(protect);

// Task creation (admin only)
router.post('/', adminOnly, createTask);

// Get user's tasks
router.get('/user', getUserTasks);

// Get all tasks (admin only)
router.get('/all', adminOnly, getTasks);

// Task operations
router.get('/:id', getTaskById);
router.put('/:id', adminOnly, updateTask);
router.delete('/:id', adminOnly, deleteTask);
router.put('/:id/complete', completeTask);

module.exports = router;