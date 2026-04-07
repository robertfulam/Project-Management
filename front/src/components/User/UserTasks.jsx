import React, { useState } from 'react';
import { taskService } from '../../services/taskService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import './UserTasks.css';

const UserTasks = ({ tasks, onUpdate, onTaskSelect }) => {
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const user = authService.getUser();

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      toast.success('Task completed! Great job! 🎉');
      onUpdate();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        toast.success('Task deleted successfully');
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      urgency: task.urgency,
      difficulty: task.difficulty,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.updateTask(editingTask._id, editForm);
      toast.success('Task updated successfully');
      setEditingTask(null);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <div className="user-tasks">
      <div className="tasks-header">
        <h2>My Tasks</h2>
        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">No tasks found</div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className={`task-card ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'overdue' : ''}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-badges">
                  <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                  <span className={`status-badge ${task.status}`}>{task.status}</span>
                </div>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-meta">
                <span className="task-category">📁 {task.category?.name}</span>
                <span className="task-difficulty">⚡ {task.difficulty}</span>
                <span className={`task-due ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'overdue' : ''}`}>
                  📅 Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  {isOverdue(task.dueDate) && task.status !== 'completed' && ' ⚠️ Overdue'}
                </span>
              </div>
              <div className="task-actions">
                <button onClick={() => handleEditTask(task)} className="edit-btn">Edit</button>
                {task.status !== 'completed' && (
                  <button onClick={() => handleCompleteTask(task._id)} className="complete-btn">Complete</button>
                )}
                {task.assignedBy?._id === user?._id && (
                  <button onClick={() => handleDeleteTask(task._id)} className="delete-btn">Delete</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Task</h3>
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
                <button type="button" onClick={() => setEditingTask(null)}>Cancel</button>
                <button type="submit">Update Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTasks;