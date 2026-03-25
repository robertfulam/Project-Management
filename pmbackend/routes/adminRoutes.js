const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  assignTaskToUsers,
  getAllSubmissions,
  reviewSubmission,
  getAllUsers,
  getAdminStats,
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// Task management
router.post('/assign-task', assignTaskToUsers);

// Submission management
router.get('/submissions', getAllSubmissions);
router.put('/submissions/:submissionId/review', reviewSubmission);

// User management
router.get('/users', getAllUsers);

// Statistics
router.get('/stats', getAdminStats);

module.exports = router;