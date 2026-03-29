const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getAdminStats
} = require('../controllers/adminController');
const {
  assignTaskToUsers,
  getAllSubmissions,
  reviewSubmission
} = require('../controllers/taskController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

// Task management
router.post('/assign-task', assignTaskToUsers);

// Submission management
router.get('/submissions', getAllSubmissions);
router.put('/submissions/:submissionId/review', reviewSubmission);

// Statistics
router.get('/stats', getAdminStats);

module.exports = router;