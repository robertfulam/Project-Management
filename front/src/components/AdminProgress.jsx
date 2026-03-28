import React, { useState, useEffect } from "react";
import { taskService } from "../services/taskService";
import { authService } from "../services/authService";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import "./AdminProgress.css";

const AdminProgress = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeView, setActiveView] = useState('personal'); // 'personal' or 'overall'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const [myTasksData, allTasksData] = await Promise.all([
        taskService.getUserTasks(),
        taskService.getAllTasks()
      ]);
      setMyTasks(myTasksData);
      setAllTasks(allTasksData);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading progress...</div>;

  const tasks = activeView === 'personal' ? myTasks : allTasks;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

  // Calculate team performance
  const teamPerformance = allTasks.reduce((acc, task) => {
    const userId = task.assignedTo?._id;
    if (!acc[userId]) {
      acc[userId] = {
        name: task.assignedTo?.name || 'Unknown',
        total: 0,
        completed: 0
      };
    }
    acc[userId].total++;
    if (task.status === 'completed') acc[userId].completed++;
    return acc;
  }, {});

  const topPerformers = Object.values(teamPerformance)
    .map(user => ({
      ...user,
      rate: user.total > 0 ? (user.completed / user.total * 100).toFixed(1) : 0
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  const barChartData = {
    labels: topPerformers.map(p => p.name),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: topPerformers.map(p => p.rate),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="admin-progress">
      <div className="progress-header">
        <h2>Admin Progress Dashboard</h2>
        <div className="view-toggle">
          <button
            className={activeView === 'personal' ? 'active' : ''}
            onClick={() => setActiveView('personal')}
          >
            My Tasks Progress
          </button>
          <button
            className={activeView === 'overall' ? 'active' : ''}
            onClick={() => setActiveView('overall')}
          >
            Team Overall Progress
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <div className="stat-value">{totalTasks}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value">{completedTasks}</div>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <div className="stat-value">{completionRate}%</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-value">{inProgressTasks}</div>
        </div>
      </div>

      {activeView === 'overall' && (
        <>
          <div className="team-performance">
            <h3>Top Performers</h3>
            <div className="chart-card">
              <Bar data={barChartData} options={{ responsive: true }} />
            </div>
          </div>

          <div className="user-list">
            <h3>User Progress Details</h3>
            {Object.values(teamPerformance).map(user => (
              <div key={user.name} className="user-progress-item">
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="task-count">{user.completed}/{user.total} tasks</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(user.completed / user.total * 100) || 0}%` }}
                  />
                </div>
                <div className="completion-rate">{((user.completed / user.total * 100) || 0).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === 'personal' && (
        <div className="personal-stats">
          <div className="priority-breakdown">
            <h3>My Tasks by Priority</h3>
            {['critical', 'high', 'medium', 'low'].map(priority => {
              const priorityTasks = tasks.filter(t => t.priority === priority);
              const priorityCompleted = priorityTasks.filter(t => t.status === 'completed').length;
              const priorityRate = priorityTasks.length > 0 
                ? (priorityCompleted / priorityTasks.length * 100).toFixed(1) 
                : 0;
              
              return (
                <div key={priority} className="priority-item">
                  <div className="priority-header">
                    <span className={`priority-badge ${priority}`}>{priority}</span>
                    <span>{priorityCompleted}/{priorityTasks.length}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${priorityRate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgress;