const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getUserTasks,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  assignTaskToUsers
} = require('../controllers/taskController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// IMPORTANT: Specific routes MUST come before parameter routes
router.get('/user', getUserTasks);
router.get('/all', adminOnly, getAllTasks);
router.post('/assign', adminOnly, assignTaskToUsers);

// Parameter routes (with :id) go AFTER specific routes
router.get('/:id', getTaskById);
router.put('/:id/complete', completeTask);
router.put('/:id', adminOnly, updateTask);
router.delete('/:id', adminOnly, deleteTask);
router.post('/', adminOnly, createTask);

module.exports = router;