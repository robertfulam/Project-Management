import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { categoryService } from '../../services/categoryService';
import { authService } from '../services/authService';
import UserProgress from './UserProgress';
import UserCategories from './UserCategories';
import UserTasks from './UserTasks';
import CreateTask from './CreateTask';
import AIAssistant from '../Common/AIAssistant';
import './UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedToday: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    totalCategories: 0
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getUser();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userTasks, userCategories] = await Promise.all([
        taskService.getUserTasks(),
        categoryService.getCategories()
      ]);
      
      const today = new Date().toDateString();
      const completedToday = userTasks.filter(t => 
        t.status === 'completed' && 
        new Date(t.completedAt).toDateString() === today
      ).length;
      
      setStats({
        totalTasks: userTasks.length,
        completedToday: completedToday,
        pendingTasks: userTasks.filter(t => t.status === 'pending').length,
        inProgressTasks: userTasks.filter(t => t.status === 'in-progress').length,
        totalCategories: userCategories.length
      });
      setTasks(userTasks);
      setCategories(userCategories);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>My Tasks</h3>
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
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>Pending</h3>
              <div className="stat-value">{stats.pendingTasks}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <h3>In Progress</h3>
              <div className="stat-value">{stats.inProgressTasks}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-info">
              <h3>My Categories</h3>
              <div className="stat-value">{stats.totalCategories}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-nav">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={activeTab === 'progress' ? 'active' : ''} onClick={() => setActiveTab('progress')}>
          My Progress
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
          My Tasks
        </button>
        <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
          My Categories
        </button>
        <button className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>
          Create Task
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-layout">
            <UserProgress tasks={tasks} onTaskSelect={handleTaskSelect} />
            <AIAssistant 
              selectedTask={selectedTask} 
              tasksCompletedToday={stats.completedToday}
            />
          </div>
        )}
        {activeTab === 'progress' && <UserProgress tasks={tasks} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'tasks' && <UserTasks tasks={tasks} onUpdate={fetchUserData} onTaskSelect={handleTaskSelect} />}
        {activeTab === 'categories' && <UserCategories categories={categories} onUpdate={fetchUserData} />}
        {activeTab === 'create' && <CreateTask categories={categories} onTaskCreated={fetchUserData} />}
      </div>
    </div>
  );
};

export default UserDashboard;