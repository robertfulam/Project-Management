import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { categoryService } from '../../services/categoryService';
import { authService } from '../services/authService';
import AdminProgress from './AdminProgress';
import UserManagement from './UserManagement';
import AllTasks from './AllTasks';
import AllCategories from './AllCategories';
import AllPending from './AllPending';
import AllComplete from './AllComplete';
import AdminAssignTask from './AdminAssignTask';
import AIAssistant from '../Common/AIAssistant';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    completedToday: 0,
    totalCategories: 0,
    assignedTasks: 0,
    assignedCategories: 0
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [allTasks, allCategories, usersRes] = await Promise.all([
        taskService.getAllTasks(),
        categoryService.getCategories(),
        fetch('http://localhost:9000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      
      const users = await usersRes.json();
      const today = new Date().toDateString();
      const completedToday = allTasks.filter(t => 
        t.status === 'completed' && 
        new Date(t.completedAt).toDateString() === today
      ).length;
      
      setStats({
        totalUsers: users.length,
        totalTasks: allTasks.length,
        completedToday: completedToday,
        totalCategories: allCategories.length,
        assignedTasks: allTasks.filter(t => t.assignedTo).length,
        assignedCategories: new Set(allTasks.map(t => t.category?._id)).size
      });
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  if (loading) return <div className="loading">Loading Admin Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <div className="stat-value">{stats.totalUsers}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>Total Tasks</h3>
              <div className="stat-value">{stats.totalTasks}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Completed Today</h3>
              <div className="stat-value">{stats.completedToday} 👏</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-info">
              <h3>Total Categories</h3>
              <div className="stat-value">{stats.totalCategories}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📌</div>
            <div className="stat-info">
              <h3>Assigned Tasks</h3>
              <div className="stat-value">{stats.assignedTasks}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <h3>Assigned Categories</h3>
              <div className="stat-value">{stats.assignedCategories}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={activeTab === 'progress' ? 'active' : ''} onClick={() => setActiveTab('progress')}>
          Progress
        </button>
        <button className={activeTab === 'assign' ? 'active' : ''} onClick={() => setActiveTab('assign')}>
          Assign Task
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
          All Tasks
        </button>
        <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
          All Categories
        </button>
        <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
          All Pending
        </button>
        <button className={activeTab === 'complete' ? 'active' : ''} onClick={() => setActiveTab('complete')}>
          All Complete
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          User Management
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-layout">
            <AdminProgress tasks={tasks} onTaskSelect={handleTaskSelect} />
            <AIAssistant 
              selectedTask={selectedTask} 
              tasksCompletedToday={stats.completedToday}
            />
          </div>
        )}
        {activeTab === 'progress' && <AdminProgress tasks={tasks} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'assign' && <AdminAssignTask onAssign={fetchDashboardData} />}
        {activeTab === 'tasks' && <AllTasks tasks={tasks} onUpdate={fetchDashboardData} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'categories' && <AllCategories onUpdate={fetchDashboardData} />}
        {activeTab === 'pending' && <AllPending tasks={tasks.filter(t => t.status !== 'completed')} onUpdate={fetchDashboardData} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'complete' && <AllComplete tasks={tasks.filter(t => t.status === 'completed')} onUpdate={fetchDashboardData} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'users' && <UserManagement onUpdate={fetchDashboardData} />}
      </div>
    </div>
  );
};

export default AdminDashboard;