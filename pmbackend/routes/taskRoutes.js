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

// ============================================
// SPECIFIC ROUTES (no :id parameter) - MUST COME FIRST
// ============================================
router.get('/user', getUserTasks);           // Get user's own tasks
router.get('/all', adminOnly, getAllTasks);   // Get all tasks (admin only)
router.post('/assign', adminOnly, assignTaskToUsers);  // Assign tasks (admin only)

// ============================================
// PARAMETER ROUTES (with :id) - COME AFTER SPECIFIC ROUTES
// ============================================
router.get('/:id', getTaskById);              // Get task by ID
router.put('/:id/complete', completeTask);    // Complete task
router.put('/:id', updateTask);               // Update task
router.delete('/:id', deleteTask);            // Delete task
router.post('/', createTask);                 // ✅ Create task - ANY AUTHENTICATED USER

module.exports = router;