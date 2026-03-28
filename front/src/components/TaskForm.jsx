import { useState, useEffect } from "react";
import { taskService } from "../services/taskService";
import { categoryService } from "../services/categoryService";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import "./TaskForm.css";

function TaskForm({ initialData = {}, onSubmit, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    category: initialData.category?._id || initialData.category || "",
    assignedTo: initialData.assignedTo?._id || initialData.assignedTo || "",
    priority: initialData.priority || "medium",
    urgency: initialData.urgency || "moderate",
    dueDate: initialData.dueDate || "",
    estimatedHours: initialData.estimatedHours || 1,
    difficulty: initialData.difficulty || "medium",
    tags: initialData.tags || [],
  });

  useEffect(() => {
    fetchCategories();
    if (authService.isAdmin()) {
      fetchUsers();
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchUsers = async () => {
    try {
      // This would need a getUsers endpoint in your backend
      const response = await fetch('http://localhost:9000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data.filter(user => user.role === 'user'));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTagChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData({
      ...formData,
      tags: tags,
    });
  };

  const handleCategorySelect = (cat) => {
    setFormData({ ...formData, category: cat._id || cat });
    setShowModal(false);
  };

  const handleNewCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const response = await categoryService.createCategory({ name: newCategory });
      setFormData({ ...formData, category: response._id });
      setCategories([...categories, response]);
      setNewCategory("");
      setShowModal(false);
      toast.success('Category created successfully');
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category');
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
      toast.error('Please select a category');
      return;
    }
    if (!formData.dueDate) {
      toast.error('Due date is required');
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      if (onSubmit) {
        // Use provided onSubmit function (for admin assigning tasks)
        result = await onSubmit(formData);
      } else {
        // Create task directly (for regular users or when no onSubmit provided)
        result = await taskService.createTask(formData);
      }
      
      toast.success('Task created successfully!');
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        assignedTo: "",
        priority: "medium",
        urgency: "moderate",
        dueDate: "",
        estimatedHours: 1,
        difficulty: "medium",
        tags: [],
      });
      
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{initialData.title ? 'Edit Task' : 'Create New Task'}</h2>
      
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

      {/* Category Selection */}
      <div className="form-group">
        <label>Category *</label>
        <div className="category-select-wrapper">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-secondary"
            disabled={loading}
          >
            + New
          </button>
        </div>
      </div>

      {/* Assign To (Admin only) */}
      {authService.isAdmin() && (
        <div className="form-group">
          <label>Assign To</label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Priority */}
      <div className="form-group">
        <label>Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Urgency */}
      <div className="form-group">
        <label>Urgency</label>
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="not-urgent">Not Urgent</option>
          <option value="moderate">Moderate</option>
          <option value="urgent">Urgent</option>
          <option value="very-urgent">Very Urgent</option>
        </select>
      </div>

      {/* Difficulty */}
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

      {/* Due Date */}
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

      {/* Estimated Hours */}
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

      {/* Tags */}
      <div className="form-group">
        <label>Tags (comma-separated)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags.join(', ')}
          onChange={handleTagChange}
          placeholder="e.g., design, urgent, frontend"
          disabled={loading}
        />
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : (initialData.title ? 'Update Task' : 'Create Task')}
        </button>
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Category</h3>
            <input
              type="text"
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button onClick={handleNewCategory} className="btn-primary">
                Create
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default TaskForm;