const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

// Get all categories (any authenticated user)
router.get('/', protect, getCategories);

// Create a new category (any authenticated user)
router.post('/', protect, createCategory);

// Update category (owner or admin)
router.put('/:id', protect, updateCategory);

// Delete category (owner or admin)
router.delete('/:id', protect, deleteCategory);

module.exports = router;