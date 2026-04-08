const mongoose = require('mongoose');
const Category = require('../models/Category');
const Task = require('../models/Task');

// Get all categories
const getCategories = async (req, res) => {
  try {
    let query = {};
    
    // Non-admins only see their own categories + default ones
    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { createdBy: req.user._id },
          { isDefault: true }
        ]
      };
    }
    
    const categories = await Category.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single category
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }
    
    res.json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    
    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      createdBy: req.user._id,
      color: color || '#6366f1',
      icon: icon || '📁'
    });
    
    res.status(201).json({
      success: true,
      message: 'Category created',
      category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, description, color, icon } = req.body;
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }
    
    // Check permission (owner or admin)
    if (category.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    
    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.color = color || category.color;
    category.icon = icon || category.icon;
    
    await category.save();
    
    res.json({
      success: true,
      message: 'Category updated',
      category
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }
    
    // Check permission (owner or admin)
    if (category.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    
    // Don't delete default categories
    if (category.isDefault) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete default categories' 
      });
    }
    
    // Delete all tasks in this category
    await Task.deleteMany({ category: category._id });
    await category.deleteOne();
    
    res.json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};