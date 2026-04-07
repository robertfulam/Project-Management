import React, { useState } from 'react';
import { taskService } from '../../services/taskService';
import toast from 'react-hot-toast';
import './AllPending.css';

const AllPending = ({ tasks, onUpdate, onTaskSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = [...new Set(tasks.map(t => t.category?.name).filter(Boolean))];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category?.name === categoryFilter;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.completeTask(taskId);
      toast.success('Task marked as complete');
      onUpdate();
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <div className="all-pending">
      <div className="pending-header">
        <h2>All Pending Tasks</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="filter-select">
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="pending-tasks">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">No pending tasks</div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className={`pending-task-card ${isOverdue(task.dueDate) ? 'overdue' : ''}`} onClick={() => onTaskSelect && onTaskSelect(task)}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-badges">
                  <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                  <span className={`urgency-badge ${task.urgency}`}>{task.urgency?.replace('-', ' ')}</span>
                </div>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-details">
                <span className="task-category">📁 {task.category?.name}</span>
                <span className="task-assignee">👤 {task.assignedTo?.name}</span>
                <span className={`task-due ${isOverdue(task.dueDate) ? 'overdue-date' : ''}`}>
                  📅 Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                  {isOverdue(task.dueDate) && ' ⚠️ Overdue'}
                </span>
              </div>
              <div className="task-actions" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleCompleteTask(task._id)} className="complete-btn">Mark Complete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllPending;