import React, { useState } from 'react';
import './AllComplete.css';

const AllComplete = ({ tasks, onTaskSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const completedDate = task.completedAt ? new Date(task.completedAt) : null;
    const today = new Date();
    const weekAgo = new Date(today.setDate(today.getDate() - 7));
    
    if (timeframe === 'today' && completedDate) {
      return matchesSearch && completedDate.toDateString() === new Date().toDateString();
    }
    if (timeframe === 'week' && completedDate) {
      return matchesSearch && completedDate >= weekAgo;
    }
    return matchesSearch;
  });

  return (
    <div className="all-complete">
      <div className="complete-header">
        <h2>Completed Tasks</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="filter-select">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
          </select>
        </div>
      </div>

      <div className="completed-stats">
        <div className="stat">Total Completed: {tasks.length}</div>
        <div className="stat">Completed Today: {tasks.filter(t => {
          const completedDate = t.completedAt ? new Date(t.completedAt) : null;
          return completedDate && completedDate.toDateString() === new Date().toDateString();
        }).length}</div>
        <div className="stat">Completed This Week: {tasks.filter(t => {
          const completedDate = t.completedAt ? new Date(t.completedAt) : null;
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return completedDate && completedDate >= weekAgo;
        }).length}</div>
      </div>

      <div className="completed-tasks">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">No completed tasks</div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className="completed-task-card" onClick={() => onTaskSelect && onTaskSelect(task)}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <span className="completion-date">
                  Completed: {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Date unknown'}
                </span>
              </div>
              <p className="task-description">{task.description}</p>
              <div className="task-details">
                <span className="task-category">📁 {task.category?.name}</span>
                <span className="task-assignee">👤 {task.assignedTo?.name}</span>
                <span className={`task-priority ${task.priority}`}>🎯 {task.priority}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllComplete;