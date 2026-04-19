import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { taskService } from '../../services/taskService';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';
import './AdminProgress.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AdminProgress = ({ tasks, onTaskSelect }) => {
  const [activeView, setActiveView] = useState('personal');
  const [personalTasks, setPersonalTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getUser();

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Fetch personal tasks
      let personalTasksData = [];
      try {
        const personalResponse = await taskService.getUserTasks();
        personalTasksData = Array.isArray(personalResponse) ? personalResponse : 
                           personalResponse?.tasks ? personalResponse.tasks : 
                           personalResponse?.data ? personalResponse.data : [];
      } catch (err) {
        console.error('Failed to fetch personal tasks:', err);
        personalTasksData = [];
      }
      
      // Fetch all tasks
      let allTasksData = [];
      try {
        const allResponse = await taskService.getAllTasks();
        allTasksData = Array.isArray(allResponse) ? allResponse : 
                       allResponse?.tasks ? allResponse.tasks : 
                       allResponse?.data ? allResponse.data : [];
      } catch (err) {
        console.error('Failed to fetch all tasks:', err);
        allTasksData = [];
      }
      
      setPersonalTasks(personalTasksData);
      setAllTasks(allTasksData);
      
      // Fetch users
      try {
        const usersRes = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const usersArray = Array.isArray(usersData) ? usersData : 
                            usersData?.users ? usersData.users : 
                            usersData?.data ? usersData.data : [];
          setUsers(usersArray.filter(u => u && u.role === 'user'));
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on selected view
  const tasksToShow = activeView === 'personal' ? personalTasks : allTasks;
  const safeTasks = Array.isArray(tasksToShow) ? tasksToShow : [];
  
  // Calculate statistics
  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter(t => t && t.status === 'completed').length;
  const inProgressTasks = safeTasks.filter(t => t && t.status === 'in-progress').length;
  const pendingTasks = safeTasks.filter(t => t && t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
  
  // Calculate overdue tasks
  const overdueTasks = safeTasks.filter(t => {
    if (t && t.status !== 'completed' && t.dueDate) {
      return new Date(t.dueDate) < new Date();
    }
    return false;
  }).length;
  
  // Calculate on-time completion rate
  const onTimeTasks = safeTasks.filter(t => {
    if (t && t.status === 'completed' && t.completedAt && t.dueDate) {
      return new Date(t.completedAt) <= new Date(t.dueDate);
    }
    return false;
  }).length;
  const onTimeRate = completedTasks > 0 ? (onTimeTasks / completedTasks * 100).toFixed(1) : 0;

  // Calculate priority distribution
  const priorityStats = {
    critical: safeTasks.filter(t => t && t.priority === 'critical').length,
    high: safeTasks.filter(t => t && t.priority === 'high').length,
    medium: safeTasks.filter(t => t && t.priority === 'medium').length,
    low: safeTasks.filter(t => t && t.priority === 'low').length
  };

  // Calculate urgency distribution
  const urgencyStats = {
    'very-urgent': safeTasks.filter(t => t && t.urgency === 'very-urgent').length,
    urgent: safeTasks.filter(t => t && t.urgency === 'urgent').length,
    moderate: safeTasks.filter(t => t && t.urgency === 'moderate').length,
    'not-urgent': safeTasks.filter(t => t && t.urgency === 'not-urgent').length
  };

  // Calculate difficulty distribution
  const difficultyStats = {
    expert: safeTasks.filter(t => t && t.difficulty === 'expert').length,
    hard: safeTasks.filter(t => t && t.difficulty === 'hard').length,
    medium: safeTasks.filter(t => t && t.difficulty === 'medium').length,
    easy: safeTasks.filter(t => t && t.difficulty === 'easy').length
  };

  // Weekly progress data
  const getWeeklyData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    });
    
    const completedByDay = last7Days.map(day => {
      const dayDate = new Date(day);
      return safeTasks.filter(t => {
        if (t && t.status === 'completed' && t.completedAt) {
          const completedDate = new Date(t.completedAt);
          return completedDate.toDateString() === dayDate.toDateString();
        }
        return false;
      }).length;
    });
    
    const createdByDay = last7Days.map(day => {
      const dayDate = new Date(day);
      return safeTasks.filter(t => {
        if (t && t.createdAt) {
          const createdDate = new Date(t.createdAt);
          return createdDate.toDateString() === dayDate.toDateString();
        }
        return false;
      }).length;
    });
    
    return { labels: last7Days, completed: completedByDay, created: createdByDay };
  };

  // Team performance data
  const getTeamPerformance = () => {
    if (!users.length) return [];
    
    const userPerformance = users.map(user => {
      const userTasks = allTasks.filter(t => t && t.assignedTo?._id === user._id);
      const completedUserTasks = userTasks.filter(t => t && t.status === 'completed');
      const overdueUserTasks = userTasks.filter(t => {
        if (t && t.status !== 'completed' && t.dueDate) {
          return new Date(t.dueDate) < new Date();
        }
        return false;
      }).length;
      
      return {
        ...user,
        totalTasks: userTasks.length,
        completedTasks: completedUserTasks.length,
        completionRate: userTasks.length > 0 ? (completedUserTasks.length / userTasks.length) * 100 : 0,
        overdueTasks: overdueUserTasks,
        onTimeRate: completedUserTasks.length > 0 
          ? (completedUserTasks.filter(t => {
              if (t && t.completedAt && t.dueDate) {
                return new Date(t.completedAt) <= new Date(t.dueDate);
              }
              return false;
            }).length / completedUserTasks.length) * 100 
          : 0
      };
    }).filter(u => u.totalTasks > 0).sort((a, b) => b.completionRate - a.completionRate);
    
    return userPerformance;
  };

  // Category performance data
  const getCategoryPerformance = () => {
    const categories = {};
    safeTasks.forEach(task => {
      if (!task) return;
      const categoryName = task.category?.name || 'Uncategorized';
      if (!categories[categoryName]) {
        categories[categoryName] = { total: 0, completed: 0 };
      }
      categories[categoryName].total++;
      if (task.status === 'completed') {
        categories[categoryName].completed++;
      }
    });
    
    return Object.entries(categories).map(([name, data]) => ({
      name,
      completed: data.completed,
      total: data.total,
      rate: data.total > 0 ? (data.completed / data.total) * 100 : 0
    })).sort((a, b) => b.rate - a.rate);
  };

  const weeklyData = getWeeklyData();
  const teamPerformance = getTeamPerformance();
  const categoryPerformance = getCategoryPerformance();

  // Chart data
  const lineChartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: weeklyData.completed,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Tasks Created',
        data: weeklyData.created,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const statusChartData = {
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [completedTasks, inProgressTasks, pendingTasks],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const priorityChartData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [priorityStats.critical, priorityStats.high, priorityStats.medium, priorityStats.low],
        backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const difficultyChartData = {
    labels: ['Expert', 'Hard', 'Medium', 'Easy'],
    datasets: [
      {
        label: 'Tasks by Difficulty',
        data: [difficultyStats.expert, difficultyStats.hard, difficultyStats.medium, difficultyStats.easy],
        backgroundColor: ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981'],
        borderRadius: 8,
      },
    ],
  };

  const urgencyChartData = {
    labels: ['Very Urgent', 'Urgent', 'Moderate', 'Not Urgent'],
    datasets: [
      {
        data: [urgencyStats['very-urgent'], urgencyStats.urgent, urgencyStats.moderate, urgencyStats['not-urgent']],
        backgroundColor: ['#dc2626', '#ef4444', '#f59e0b', '#10b981'],
        borderWidth: 0,
      },
    ],
  };

  const categoryBarData = {
    labels: categoryPerformance.map(c => c.name.length > 15 ? c.name.substring(0, 12) + '...' : c.name),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: categoryPerformance.map(c => c.rate),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const teamBarData = {
    labels: teamPerformance.slice(0, 10).map(u => u.name?.split(' ')[0] || u.name),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: teamPerformance.slice(0, 10).map(u => u.completionRate),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw.toFixed(1)}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => `${value}%` },
      },
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

  if (loading) {
    return (
      <div className="progress-loading">
        <div className="loading-spinner"></div>
        <p>Loading progress data...</p>
      </div>
    );
  }

  return (
    <div className="admin-progress">
      <div className="progress-header">
        <h2>Progress Dashboard</h2>
        <div className="view-toggle">
          <button
            className={activeView === 'personal' ? 'active' : ''}
            onClick={() => setActiveView('personal')}
          >
            👤 My Personal Progress
          </button>
          <button
            className={activeView === 'team' ? 'active' : ''}
            onClick={() => setActiveView('team')}
          >
            👥 Team Overall Progress
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-info">
            <h3>Total Tasks</h3>
            <div className="metric-value">{totalTasks}</div>
            <div className="metric-subtitle">All tasks</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-info">
            <h3>Completed</h3>
            <div className="metric-value">{completedTasks}</div>
            <div className="metric-subtitle">{completionRate}% of total</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-info">
            <h3>On-Time Rate</h3>
            <div className="metric-value">{onTimeRate}%</div>
            <div className="metric-subtitle">{onTimeTasks}/{completedTasks} completed on time</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⚠️</div>
          <div className="metric-info">
            <h3>Overdue Tasks</h3>
            <div className="metric-value">{overdueTasks}</div>
            <div className="metric-subtitle">Past due date</div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        <div className="chart-card large">
          <h3>Weekly Progress Trend</h3>
          <div className="chart-container">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <div className="chart-container small">
            <Doughnut data={statusChartData} options={doughnutOptions} />
          </div>
          <div className="status-summary">
            <div className="status-item">
              <span className="status-dot completed"></span>
              <span>Completed: {completedTasks}</span>
            </div>
            <div className="status-item">
              <span className="status-dot progress"></span>
              <span>In Progress: {inProgressTasks}</span>
            </div>
            <div className="status-item">
              <span className="status-dot pending"></span>
              <span>Pending: {pendingTasks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Priority Distribution</h3>
          <div className="chart-container small">
            <Doughnut data={priorityChartData} options={doughnutOptions} />
          </div>
          <div className="priority-summary">
            <div className="priority-item critical">Critical: {priorityStats.critical}</div>
            <div className="priority-item high">High: {priorityStats.high}</div>
            <div className="priority-item medium">Medium: {priorityStats.medium}</div>
            <div className="priority-item low">Low: {priorityStats.low}</div>
          </div>
        </div>
        <div className="chart-card">
          <h3>Urgency Distribution</h3>
          <div className="chart-container small">
            <Doughnut data={urgencyChartData} options={doughnutOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Difficulty Distribution</h3>
          <div className="chart-container">
            <Bar data={difficultyChartData} options={{ ...barOptions, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Category Performance */}
      {categoryPerformance.length > 0 && (
        <div className="category-performance">
          <h3>Category Performance</h3>
          <div className="chart-card full-width">
            <div className="chart-container" style={{ height: '300px' }}>
              <Bar data={categoryBarData} options={barOptions} />
            </div>
          </div>
          <div className="category-list">
            {categoryPerformance.map(category => (
              <div key={category.name} className="category-item">
                <div className="category-header">
                  <span className="category-name">{category.name}</span>
                  <span className="category-stats">{category.completed}/{category.total} tasks</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${category.rate}%`, backgroundColor: '#10b981' }} />
                </div>
                <div className="category-rate">{category.rate.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Performance Section (Admin Only) */}
      {activeView === 'team' && teamPerformance.length > 0 && (
        <div className="team-performance-section">
          <h3>Team Performance</h3>
          <div className="chart-card full-width">
            <div className="chart-container" style={{ height: '400px' }}>
              <Bar data={teamBarData} options={barOptions} />
            </div>
          </div>
          <div className="team-list">
            <h4>User Performance Details</h4>
            {teamPerformance.map(user => (
              <div key={user._id} className="team-item">
                <div className="team-header">
                  <div className="team-info">
                    <span className="team-name">{user.name}</span>
                    <span className="team-email">{user.email}</span>
                  </div>
                  <div className="team-stats">
                    <span className="completion-rate">{user.completionRate.toFixed(1)}%</span>
                    <span className="task-count">{user.completedTasks}/{user.totalTasks}</span>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${user.completionRate}%`, backgroundColor: '#6366f1' }} />
                </div>
                <div className="team-details">
                  <span className="on-time">⏱️ On-Time: {user.onTimeRate.toFixed(1)}%</span>
                  <span className="overdue">⚠️ Overdue: {user.overdueTasks}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task List for Quick Reference */}
      <div className="recent-tasks">
        <h3>Recent Tasks</h3>
        <div className="tasks-list">
          {safeTasks.slice(0, 5).map(task => (
            <div key={task._id} className="task-item" onClick={() => onTaskSelect && onTaskSelect(task)}>
              <div className={`task-status ${task.status}`}></div>
              <div className="task-info">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span className="task-priority">{task.priority}</span>
                  <span className="task-due">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                </div>
              </div>
              <div className="task-assignee">
                {task.assignedTo?.name || 'Unassigned'}
              </div>
            </div>
          ))}
          {safeTasks.length === 0 && (
            <div className="empty-tasks">No tasks to display</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProgress;
