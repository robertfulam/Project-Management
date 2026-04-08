const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getDashboardStats,
  getMyTodo,
  getCompleteTasks,
  getPendingTasks,
  getProgressTasks,
} = require('../controllers/dashboardController');

const router = express.Router();

// All dashboard routes are protected
router.use(protect);

// Dashboard statisticss
router.get('/stats', getDashboardStats);

// Individual dashboard views
router.get('/mytodo', getMyTodo);
router.get('/complete', getCompleteTasks);
router.get('/pending', getPendingTasks);
router.get('/progress', getProgressTasks);

module.exports = router;