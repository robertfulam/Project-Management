const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

// Get all categories (any authenticated user)
router.get('/', protect, getCategories);

// Category management (admin only)
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;