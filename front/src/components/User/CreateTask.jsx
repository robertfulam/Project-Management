import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taskService } from "../../services/taskService";
import { categoryService } from "../services/categoryService";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import "./CreateTask.css";

const CreateTask = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#6366f1",
    icon: "📁"
  });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    urgency: "moderate",
    difficulty: "medium",
    dueDate: "",
    estimatedHours: 1,
    tags: "",
  });

  const [selectedCategoryColor, setSelectedCategoryColor] = useState("#6366f1");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Update selected category color when category changes
    if (name === 'category') {
      const selectedCat = categories.find(c => c._id === value);
      if (selectedCat) {
        setSelectedCategoryColor(selectedCat.color);
      }
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const category = await categoryService.createCategory({
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color,
        icon: newCategory.icon
      });
      
      // Refresh categories list
      await fetchCategories();
      
      // Auto-select the newly created category
      setFormData({ ...formData, category: category._id });
      setSelectedCategoryColor(category.color);
      
      // Reset new category form
      setNewCategory({ name: "", description: "", color: "#6366f1", icon: "📁" });
      setShowNewCategory(false);
      
      toast.success(`Category "${category.name}" created and selected!`);
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error(error.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Task description is required');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category or create a new one');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Due date is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const currentUser = authService.getUser();
      
      // Prepare task data
      const taskData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        assignedTo: currentUser?._id,
      };
      
      await taskService.createTask(taskData);
      toast.success('Task created successfully!');
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        urgency: "moderate",
        difficulty: "medium",
        dueDate: "",
        estimatedHours: 1,
        tags: "",
      });
      
      // Navigate back to dashboard
      navigate('/');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec489a", "#14b8a6", "#f97316"
  ];

  const iconOptions = ["📁", "💼", "🎨", "💻", "📚", "🏠", "💪", "🎯", "⭐", "🔥"];

  // Group categories by user ownership
  const currentUser = authService.getUser();
  const userCategories = categories.filter(cat => cat.createdBy?._id === currentUser?._id);
  const defaultCategories = categories.filter(cat => cat.isDefault || cat.createdBy?._id !== currentUser?._id);

  return (
    <div className="create-task-container">
      <div className="create-task-header">
        <h2>Create New Task</h2>
        <p>Fill in the details below to create a new task</p>
      </div>

      <form className="create-task-form" onSubmit={handleSubmit}>
        {/* Task Title */}
        <div className="form-group">
          <label>Task Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows="4"
            required
            disabled={loading}
          />
        </div>

        {/* Category Selection with Inline Creation */}
        <div className="form-group">
          <label>Category *</label>
          
          {!showNewCategory ? (
            <div className="category-select-wrapper">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ borderColor: selectedCategoryColor }}
              >
                <option value="">-- Select a category --</option>
                
                {userCategories.length > 0 && (
                  <optgroup label="📁 My Categories">
                    {userCategories.map((cat) => (
                      <option key={cat._id} value={cat._id} style={{ backgroundColor: `${cat.color}10` }}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {defaultCategories.length > 0 && (
                  <optgroup label="🌟 Default Categories">
                    {defaultCategories.map((cat) => (
                      <option key={cat._id} value={cat._id} style={{ backgroundColor: `${cat.color}10` }}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="btn-new-category"
                disabled={loading}
                title="Create a new category"
              >
                + New Category
              </button>
            </div>
          ) : (
            <div className="new-category-panel">
              <div className="new-category-header">
                <div className="new-category-title">
                  <span className="new-category-icon">✨</span>
                  <span>Create New Category</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(false)}
                  className="close-new-category"
                >
                  ✕
                </button>
              </div>
              
              <div className="new-category-form">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="e.g., Work, Personal, Urgent, Design"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>Description (optional)</label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Describe what this category is for"
                    rows="2"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Choose Color</label>
                    <div className="color-picker">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`color-option ${newCategory.color === color ? 'selected' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewCategory({...newCategory, color})}
                          disabled={loading}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Choose Icon</label>
                    <div className="icon-picker">
                      {iconOptions.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          className={`icon-option ${newCategory.icon === icon ? 'selected' : ''}`}
                          onClick={() => setNewCategory({...newCategory, icon})}
                          disabled={loading}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="new-category-actions">
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(false)}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="btn-primary"
                    disabled={!newCategory.name.trim() || loading}
                  >
                    {loading ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {!showNewCategory && (
            <small className="form-hint">
              💡 Can't find the right category? Click the "+ New Category" button to create one instantly.
            </small>
          )}
        </div>

        {/* Priority, Urgency, Difficulty */}
        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
            </select>
          </div>

          <div className="form-group">
            <label>Urgency</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="not-urgent">Not Urgent</option>
              <option value="moderate">Moderate Urgency</option>
              <option value="urgent">Urgent</option>
              <option value="very-urgent">Very Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>

        {/* Due Date and Estimated Hours */}
        <div className="form-row">
          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Estimated Hours</label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              min="0"
              step="0.5"
              disabled={loading}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., design, urgent, frontend, bug"
            disabled={loading}
          />
          <small className="form-hint">Separate multiple tags with commas</small>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Task...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;