import React, { useState, useEffect } from 'react';
import { taskService } from '../services/taskService';
import { categoryService } from '../components/services/categoryService';
import { authService } from '../components/services/authService';
import UserProgress from '../components/User/UserProgress';
import UserTasks from '../components/User/UserTasks';
import UserCategories from '../components/User/UserCategories';
import CreateTask from '../components/User/CreateTask';
import AIAssistant from '../components/Common/AIAssistant';
import '../components/User/UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedToday: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    totalCategories: 0,
    completionRate: 0
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = authService.getUser();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user tasks
      let userTasks = [];
      try {
        const tasksResponse = await taskService.getUserTasks();
        userTasks = Array.isArray(tasksResponse) ? tasksResponse : 
                    tasksResponse?.tasks ? tasksResponse.tasks : 
                    tasksResponse?.data ? tasksResponse.data : [];
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        userTasks = [];
      }
      
      // Fetch user categories
      let userCategories = [];
      try {
        const categoriesResponse = await categoryService.getCategories();
        userCategories = Array.isArray(categoriesResponse) ? categoriesResponse : 
                        categoriesResponse?.categories ? categoriesResponse.categories : 
                        categoriesResponse?.data ? categoriesResponse.data : [];
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        userCategories = [];
      }
      
      // Calculate stats
      const today = new Date().toDateString();
      const completedTodayCount = userTasks.filter(t => 
        t && t.status === 'completed' && 
        t.completedAt && 
        new Date(t.completedAt).toDateString() === today
      ).length;
      
      const totalTasksCount = userTasks.length;
      const completedTasksCount = userTasks.filter(t => t && t.status === 'completed').length;
      const completionRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount * 100).toFixed(1) : 0;
      
      setStats({
        totalTasks: totalTasksCount,
        completedToday: completedTodayCount,
        pendingTasks: userTasks.filter(t => t && t.status === 'pending').length,
        inProgressTasks: userTasks.filter(t => t && t.status === 'in-progress').length,
        totalCategories: userCategories.length,
        completionRate: completionRate
      });
      
      setTasks(userTasks);
      setCategories(userCategories);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  if (loading) {
    return (
      <div className="user-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchUserData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'User'}!</h1>
          <p>Here's your task overview for today</p>
        </div>
        <button onClick={() => setActiveTab('create')} className="create-task-btn">
          + Create New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
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
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Completion Rate</h3>
            <div className="stat-value">{stats.completionRate}%</div>
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
            <h3>Categories</h3>
            <div className="stat-value">{stats.totalCategories}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'progress' ? 'active' : ''} 
          onClick={() => setActiveTab('progress')}
        >
          My Progress
        </button>
        <button 
          className={activeTab === 'tasks' ? 'active' : ''} 
          onClick={() => setActiveTab('tasks')}
        >
          My Tasks
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''} 
          onClick={() => setActiveTab('categories')}
        >
          My Categories
        </button>
        <button 
          className={activeTab === 'create' ? 'active' : ''} 
          onClick={() => setActiveTab('create')}
        >
          Create Task
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-layout">
            <UserProgress 
              tasks={tasks} 
              onTaskSelect={handleTaskSelect} 
            />
            <AIAssistant 
              selectedTask={selectedTask} 
              tasksCompletedToday={stats.completedToday}
            />
          </div>
        )}
        
        {activeTab === 'progress' && (
          <UserProgress 
            tasks={tasks} 
            onTaskSelect={handleTaskSelect} 
          />
        )}
        
        {activeTab === 'tasks' && (
          <UserTasks 
            tasks={tasks} 
            onUpdate={fetchUserData} 
            onTaskSelect={handleTaskSelect}
          />
        )}
        
        {activeTab === 'categories' && (
          <UserCategories 
            categories={categories} 
            onUpdate={fetchUserData} 
          />
        )}
        
        {activeTab === 'create' && (
          <CreateTask onTaskCreated={fetchUserData} />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;