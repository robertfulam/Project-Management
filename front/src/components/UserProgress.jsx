import React, { useState, useEffect } from "react";
import { dashboardService } from "../services/dashboardService";
import { taskService } from "../services/taskService";
import { Line, Doughnut } from "react-chartjs-2";
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
} from "chart.js";
import "./UserProgress.css";

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

const UserProgress = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const [tasksData, statsData] = await Promise.all([
        taskService.getUserTasks(),
        dashboardService.getStats()
      ]);
      setTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading progress...</div>;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

  // Weekly progress data
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const weeklyData = last7Days.map((_, index) => {
    const dayTasks = tasks.filter(task => {
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const today = new Date();
        today.setDate(today.getDate() - (6 - index));
        return completedDate.toDateString() === today.toDateString();
      }
      return false;
    });
    return dayTasks.length;
  });

  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Tasks Completed',
        data: weeklyData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
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

  return (
    <div className="user-progress">
      <h2>My Progress Dashboard</h2>
      
      <div className="progress-stats">
        <div className="stat-card">
          <h3>Overall Completion</h3>
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-subtitle">{completedTasks}/{totalTasks} tasks</div>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="stat-value">{inProgressTasks}</div>
          <div className="stat-subtitle">Active tasks</div>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <div className="stat-value">{pendingTasks}</div>
          <div className="stat-subtitle">Need attention</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Weekly Progress</h3>
          <Line data={lineChartData} options={{ responsive: true }} />
        </div>
        <div className="chart-card">
          <h3>Task Status</h3>
          <Doughnut data={doughnutData} />
        </div>
      </div>

      <div className="tasks-breakdown">
        <h3>Task Breakdown by Priority</h3>
        <div className="priority-stats">
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
                <div className="priority-rate">{priorityRate}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserProgress;