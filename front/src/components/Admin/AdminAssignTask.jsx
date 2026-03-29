import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { categoryService } from '../../services/categoryService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import './AdminAssignTask.css';

const AdminAssignTask = ({ onAssign }) => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    urgency: 'moderate',
    difficulty: 'medium',
    dueDate: '',
    assignToAll: false,
    includeSelf: false,
    assignedTo: [],
    tags: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setUsers(data.filter(user => user.role === 'user'));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleUserSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      assignedTo: selectedOptions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    
    if (!formData.assignToAll && formData.assignedTo.length === 0) {
      toast.error('Please select at least one user or assign to all');
      return;
    }
    
    setLoading(true);
    
    try {
      const taskData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await taskService.assignTask(taskData);
      toast.success('Task assigned successfully!');
      
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        urgency: 'moderate',
        difficulty: 'medium',
        dueDate: '',
        assignToAll: false,
        includeSelf: false,
        assignedTo: [],
        tags: ''
      });
      
      if (onAssign) onAssign();
    } catch (error) {
      console.error('Failed to assign task:', error);
      toast.error(error.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-assign-task">
      <h2>Assign New Task</h2>
      <form onSubmit={handleSubmit} className="assign-form">
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

        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
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
          </div>

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
        </div>

        <div className="form-row">
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
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., urgent, design, frontend"
              disabled={loading}
            />
          </div>
        </div>

        <div className="assignment-options">
          <h3>Assignment Options</h3>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="assignToAll"
              checked={formData.assignToAll}
              onChange={handleChange}
              disabled={loading}
            />
            Assign to all users
          </label>

          {formData.assignToAll && (
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="includeSelf"
                checked={formData.includeSelf}
                onChange={handleChange}
                disabled={loading}
              />
              Include myself in assignment
            </label>
          )}

          {!formData.assignToAll && (
            <div className="form-group">
              <label>Select Users *</label>
              <select
                multiple
                value={formData.assignedTo}
                onChange={handleUserSelect}
                className="user-select"
                size="5"
                disabled={loading}
              >
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <small>Hold Ctrl/Cmd to select multiple users</small>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAssignTask;