import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import './UserProgress.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const UserProgress = ({ tasks, onTaskSelect }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

  const overdueTasks = tasks.filter(t => {
    if (t.status !== 'completed' && t.dueDate) {
      return new Date(t.dueDate) < new Date();
    }
    return false;
  }).length;

  const onTimeTasks = tasks.filter(t => {
    if (t.status === 'completed' && t.completedAt && t.dueDate) {
      return new Date(t.completedAt) <= new Date(t.dueDate);
    }
    return false;
  }).length;
  const onTimeRate = completedTasks > 0 ? (onTimeTasks / completedTasks * 100).toFixed(1) : 0;

  const weeklyData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const completedByDay = last7Days.map(day => {
      const dayDate = new Date(day);
      return tasks.filter(t => {
        if (t.status === 'completed' && t.completedAt) {
          const completedDate = new Date(t.completedAt);
          return completedDate.toDateString() === dayDate.toDateString();
        }
        return false;
      }).length;
    });
    
    return { labels: last7Days, completed: completedByDay };
  };

  const priorityStats = {
    critical: tasks.filter(t => t.priority === 'critical').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  const weekly = weeklyData();

  const lineChartData = {
    labels: weekly.labels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: weekly.completed,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const doughnutData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [completedTasks, inProgressTasks, pendingTasks],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="user-progress">
      <h2>My Progress</h2>
      
      <div className="progress-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Completion Rate</h3>
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-subtitle">{completedTasks}/{totalTasks} tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h3>On-Time Rate</h3>
            <div className="stat-value">{onTimeRate}%</div>
            <div className="stat-subtitle">{onTimeTasks}/{completedTasks} on time</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Overdue Tasks</h3>
            <div className="stat-value">{overdueTasks}</div>
            <div className="stat-subtitle">Need attention</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <div className="stat-value">{inProgressTasks}</div>
            <div className="stat-subtitle">Active tasks</div>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Weekly Progress</h3>
          <div className="chart-container">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Task Status</h3>
          <div className="chart-container small">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="priority-breakdown">
        <h3>Priority Breakdown</h3>
        <div className="priority-list">
          {Object.entries(priorityStats).map(([priority, count]) => (
            <div key={priority} className="priority-item">
              <div className="priority-header">
                <span className={`priority-label ${priority}`}>{priority}</span>
                <span className="priority-count">{count}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${totalTasks > 0 ? (count / totalTasks * 100) : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-tasks">
        <h3>Recent Tasks</h3>
        <div className="tasks-list">
          {tasks.slice(0, 5).map(task => (
            <div key={task._id} className="task-item" onClick={() => onTaskSelect && onTaskSelect(task)}>
              <div className={`task-status ${task.status}`}></div>
              <div className="task-info">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className="task-priority">{task.priority}</span>
                  <span className="task-due">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProgress;