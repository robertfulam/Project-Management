const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  createSubmission,
  getUserSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getAllSubmissions,
  reviewSubmission,
  getSubmissionStats
} = require('../controllers/submissionController');
const upload = require('../middleware/upload');

const router = express.Router();

// All submission routes require authentication
router.use(protect);

// ============================================
// USER SUBMISSION ROUTES
// ============================================

// Create a new submission
router.post('/', createSubmission);

// Get user's submissions
router.get('/user', getUserSubmissions);

// Get submission statistics
router.get('/stats', getSubmissionStats);

// Get, update, delete submission by ID
router.get('/:id', getSubmissionById);
router.put('/:id', updateSubmission);
router.delete('/:id', deleteSubmission);

// File upload route
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: {
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    }
  });
});

// ============================================
// ADMIN SUBMISSION ROUTES
// ============================================

// Get all submissions (admin only)
router.get('/admin/all', adminOnly, getAllSubmissions);

// Review submission (admin only)
router.put('/admin/:id/review', adminOnly, reviewSubmission);

module.exports = router;