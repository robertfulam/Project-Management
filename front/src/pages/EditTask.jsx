import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskService } from "../services/taskService";
import { categoryService } from "../services/categoryService";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import "../components/EditTask.css";

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [task, setTask] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    assignedTo: "",
    priority: "medium",
    urgency: "moderate",
    dueDate: "",
    estimatedHours: 1,
    actualHours: 0,
    difficulty: "medium",
    tags: [],
    status: "pending",
    progress: 0
  });

  useEffect(() => {
    fetchTaskData();
    fetchCategories();
    if (authService.isAdmin()) {
      fetchUsers();
    }
  }, [id]);

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      const taskData = await taskService.getTaskById(id);
      setTask(taskData);
      
      // Populate form with task data
      setFormData({
        title: taskData.title || "",
        description: taskData.description || "",
        category: taskData.category?._id || taskData.category || "",
        assignedTo: taskData.assignedTo?._id || taskData.assignedTo || "",
        priority: taskData.priority || "medium",
        urgency: taskData.urgency || "moderate",
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().slice(0, 16) : "",
        estimatedHours: taskData.estimatedHours || 1,
        actualHours: taskData.actualHours || 0,
        difficulty: taskData.difficulty || "medium",
        tags: taskData.tags || [],
        status: taskData.status || "pending",
        progress: taskData.progress || 0
      });
      
      setError(null);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      setError(error.message || 'Failed to load task');
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleTagChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({
      ...formData,
      tags: tags,
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0,
    });
  };

  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value);
    setFormData({
      ...formData,
      progress: Math.min(100, Math.max(0, value)),
    });
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
    
    setSaving(true);
    
    try {
      const updatedTask = {
        ...formData,
        // If status is completed but no completedAt, add it
        ...(formData.status === 'completed' && !task.completedAt && { completedAt: new Date() })
      };
      
      await taskService.updateTask(id, updatedTask);
      toast.success('Task updated successfully!');
      navigate(`/task/${id}`);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error(error.message || 'Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await taskService.deleteTask(id);
        toast.success('Task deleted successfully');
        navigate('/');
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.error(error.message || 'Failed to delete task');
      }
    }
  };

  if (loading) {
    return (
      <div className="edit-task-container">
        <div className="loading-spinner">Loading task details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-task-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchTaskData} className="retry-btn">
            Retry
          </button>
          <button onClick={() => navigate('/')} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-task-container">
      <div className="edit-task-header">
        <h2>Edit Task</h2>
        <button onClick={handleDelete} className="delete-task-btn">
          Delete Task
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="edit-task-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label>Task Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="5"
              required
              disabled={saving}
            />
          </div>
        </div>

        {/* Category and Assignment */}
        <div className="form-section">
          <h3>Category & Assignment</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {authService.isAdmin() && (
              <div className="form-group">
                <label>Assigned To</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  disabled={saving}
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
          </div>
        </div>

        {/* Priority & Status */}
        <div className="form-section">
          <h3>Priority & Status</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Urgency</label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="not-urgent">Not Urgent</option>
                <option value="moderate">Moderate</option>
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
                disabled={saving}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Progress (%)</label>
              <input
                type="range"
                name="progress"
                value={formData.progress}
                onChange={handleProgressChange}
                min="0"
                max="100"
                step="5"
                disabled={saving}
              />
              <div className="progress-value">{formData.progress}%</div>
            </div>
          </div>
        </div>

        {/* Time & Effort */}
        <div className="form-section">
          <h3>Time & Effort</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Due Date *</label>
              <input
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Estimated Hours</label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleNumberChange}
                min="0"
                step="0.5"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Actual Hours</label>
              <input
                type="number"
                name="actualHours"
                value={formData.actualHours}
                onChange={handleNumberChange}
                min="0"
                step="0.5"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="form-section">
          <h3>Tags</h3>
          
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagChange}
              placeholder="e.g., urgent, design, frontend, bug"
              disabled={saving}
            />
            <small className="form-hint">
              Separate tags with commas. Example: urgent, design, frontend
            </small>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="current-tags">
              <strong>Current Tags:</strong>
              {formData.tags.map(tag => (
                <span key={tag} className="tag-pill">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(`/task/${id}`)} 
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;