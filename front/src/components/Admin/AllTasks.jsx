import React, { useState } from 'react';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';
import './AllTasks.css';

const AllTasks = ({ tasks, onUpdate, onTaskSelect }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Ensure tasks is an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const filteredTasks = safeTasks.filter(task => {
    if (!task) return false;
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        toast.success('Task deleted successfully');
        if (onUpdate) onUpdate();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      toast.success('Task marked as complete');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      urgency: task.urgency || 'moderate',
      difficulty: task.difficulty || 'medium',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      status: task.status || 'pending'
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
      toast.error('Failed to update task');
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'in-progress': return 'status-progress';
      default: return 'status-pending';
    }
  };

  return (
    <div className="all-tasks">
      <div className="tasks-header">
        <h2>All Tasks</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Assigned To</th>
              <th>Owned/Created By</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">No tasks found</td>
              </tr>
            ) : (
              filteredTasks.map(task => (
                <tr key={task._id} onClick={() => onTaskSelect && onTaskSelect(task)} className="task-row">
                  <td className="task-title">{task.title}</td>
                  <td>{task.category?.name || 'Uncategorized'}</td>
                  <td>
                    <div className="assignee-info">
                      <span className="assignee-name">{task.assignedTo?.name || 'Unassigned'}</span>
                      <span className="assignee-email">{task.assignedTo?.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="owner-info">
                      <span className="owner-name">{task.assignedBy?.name || 'System'}</span>
                      <span className="owner-email">{task.assignedBy?.email}</span>
                    </div>
                  </td>
                  <td><span className={`priority-badge ${getPriorityClass(task.priority)}`}>{task.priority}</span></td>
                  <td><span className={`status-badge ${getStatusClass(task.status)}`}>{task.status}</span></td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEditTask(task)} className="edit-btn">Edit</button>
                    {task.status !== 'completed' && (
                      <button onClick={() => handleCompleteTask(task._id)} className="complete-btn">Complete</button>
                    )}
                    <button onClick={() => handleDeleteTask(task._id)} className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="datetime-local"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingTask(null)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Update Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTasks;