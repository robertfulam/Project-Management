const Category = require('../models/Category');
const Task = require('../models/Task');

// Get user's categories (only their own + default)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      $or: [
        { createdBy: req.user._id },
        { isDefault: true }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create category (any user)
const createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    
    // Check if category already exists for this user
    const existingCategory = await Category.findOne({ 
      name: name.trim(),
      createdBy: req.user._id
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      createdBy: req.user._id, // assign to the logged-in user
      isDefault: false,
      color: color || '#6366f1',
      icon: icon || '📁'
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update category (owner or admin)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && category.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this category' });
    }
    
    const { name, description, color, icon } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    if (icon) category.icon = icon;
    
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete category (owner or admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && category.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this category' });
    }
    
    // Don't allow deleting default categories
    if (category.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default categories' });
    }
    
    // Delete all tasks in this category
    await Task.deleteMany({ category: category._id });
    await category.deleteOne();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };