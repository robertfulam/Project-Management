const Category = require('../models/Category');
const Task = require('../models/Task');

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await Category.create({
      name,
      description,
      createdBy: req.user._id,
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('createdBy', 'name email');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;
    
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Delete all tasks in this category
    await Task.deleteMany({ category: category._id });
    
    await category.deleteOne();
    
    res.json({ message: 'Category and all associated tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };