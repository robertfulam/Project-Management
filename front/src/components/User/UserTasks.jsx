import React, { useState } from 'react';
import { taskService } from '../../services/taskService';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './UserTasks.css';

const UserTasks = ({ tasks, onUpdate, onTaskSelect }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    urgency: 'moderate',
    difficulty: 'medium',
    dueDate: ''
  });
  const user = authService.getUser();

  // Ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = safeTasks.filter(task => {
    if (!task) return false;
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCompleteTask = async (taskId, e) => {
    e.stopPropagation();
    try {
      await taskService.completeTask(taskId);
      toast.success('Task completed! 🎉');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await taskService.deleteTask(taskId);
        toast.success('Task deleted successfully');
        if (onUpdate) onUpdate();
      } catch (error) {
        toast.error(error.message || 'Failed to delete task');
      }
    }
  };

  const handleEditTask = (task, e) => {
    e.stopPropagation();
    setEditingTask(task);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      urgency: task.urgency || 'moderate',
      difficulty: task.difficulty || 'medium',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.updateTask(editingTask._id, editForm);
      toast.success('Task updated successfully');
      setEditingTask(null);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-progress';
      default: return 'status-pending';
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 'critical': return '🔴 Critical';
      case 'high': return '🟠 High';
      case 'medium': return '🟡 Medium';
      case 'low': return '🟢 Low';
      default: return '🟡 Medium';
    }
  };

  const getUrgencyLabel = (urgency) => {
    switch(urgency) {
      case 'very-urgent': return '🔴 Very Urgent';
      case 'urgent': return '🟠 Urgent';
      case 'moderate': return '🟡 Moderate';
      case 'not-urgent': return '🟢 Not Urgent';
      default: return '🟡 Moderate';
    }
  };

  return (
    <div className="user-tasks">
      <div className="tasks-header">
        <h2>My Tasks</h2>
        <div className="filters">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="tasks-stats">
        <div className="stat-badge">
          Total: {safeTasks.length}
        </div>
        <div className="stat-badge completed">
          Completed: {safeTasks.filter(t => t?.status === 'completed').length}
        </div>
        <div className="stat-badge pending">
          Pending: {safeTasks.filter(t => t?.status === 'pending').length}
        </div>
        <div className="stat-badge progress">
          In Progress: {safeTasks.filter(t => t?.status === 'in-progress').length}
        </div>
      </div>

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Tasks Found</h3>
            <p>You don't have any tasks matching your filters.</p>
            <button onClick={() => window.location.href = '/add'} className="create-task-btn">
              + Create Your First Task
            </button>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task._id} 
              className={`task-card ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'overdue' : ''} ${task.status === 'completed' ? 'completed-task' : ''}`}
              onClick={() => onTaskSelect && onTaskSelect(task)}
            >
              <div className="task-header">
                <div className="task-title-section">
                  <h3>{task.title}</h3>
                  {isOverdue(task.dueDate) && task.status !== 'completed' && (
                    <span className="overdue-badge">Overdue!</span>
                  )}
                </div>
                <div className="task-badges">
                  <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                  <span className={`status-badge ${getStatusClass(task.status)}`}>
                    {task.status === 'in-progress' ? 'In Progress' : task.status}
                  </span>
                </div>
              </div>
              
              <p className="task-description">
                {task.description?.length > 120 
                  ? `${task.description.substring(0, 120)}...` 
                  : task.description}
              </p>
              
              <div className="task-meta">
                <div className="meta-item">
                  <span className="meta-icon">📁</span>
                  <span className="meta-text">{task.category?.name || 'Uncategorized'}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">⚡</span>
                  <span className="meta-text">{getUrgencyLabel(task.urgency)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span className={`meta-text due-date ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'overdue-date' : ''}`}>
                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date set'}
                    {isOverdue(task.dueDate) && task.status !== 'completed' && ' ⚠️'}
                  </span>
                </div>
              </div>
              
              {task.tags && task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">#{tag}</span>
                  ))}
                  {task.tags.length > 3 && (
                    <span className="tag-more">+{task.tags.length - 3}</span>
                  )}
                </div>
              )}
              
              <div className="task-actions">
                <button 
                  onClick={(e) => handleEditTask(task, e)} 
                  className="edit-btn"
                  title="Edit Task"
                >
                  ✏️ Edit
                </button>
                {task.status !== 'completed' && (
                  <button 
                    onClick={(e) => handleCompleteTask(task._id, e)} 
                    className="complete-btn"
                    title="Mark as Complete"
                  >
                    ✅ Complete
                  </button>
                )}
                <button 
                  onClick={(e) => handleDeleteTask(task._id, e)} 
                  className="delete-btn"
                  title="Delete Task"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button className="modal-close" onClick={() => setEditingTask(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
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
                    value={editForm.urgency}
                    onChange={(e) => setEditForm({...editForm, urgency: e.target.value})}
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
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="datetime-local"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingTask(null)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTasks;    