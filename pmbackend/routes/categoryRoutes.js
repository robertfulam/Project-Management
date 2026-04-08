const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.get('/', getCategories);           // Get all categories
router.get('/:id', getCategoryById);      // Get one category
router.post('/', createCategory);         // Create category
router.put('/:id', updateCategory);       // Update category
router.delete('/:id', deleteCategory);    // Delete category

module.exports = router;